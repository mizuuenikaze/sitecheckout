var dom = require('ampersand-dom');
var PageView = require('./base');
var templates = require('../templates');
var PayPalExpressForm = require('../forms/payPalExpressForm');
var PayPalExpressConfirm = require('../forms/payPalExpressConfirm');
var app = require('ampersand-app');


module.exports = PageView.extend({
    pageTitle: 'checkout',
    template: templates.pages.checkout,
	events: {
		'click [data-hook=paywithpaypal]': 'flowPayPal',
		'click [data-hook=paywithstripe]': 'flowStripe'
	},
	bindings: {
		'errorMessage': [{
			type: 'text',
			hook: 'error-message'
		},{
			type: 'booleanClass',
			hook: 'error-message',
			yes: 'show',
			no: 'hidden'
		}]
	},
	initialize: function () {
		this.listenTo(app, 'externalReady', this.paypalButtonRender);

		// always start with a clean model
		this.model.unset('service');
		this.model.unset('price');
		this.model.unset('committedPayment');
		this.model.unset('paymentMethod');
		this.model.unset('paymentId');
		this.model.unset('payerId');
		this.model.unset('currentStep');
	},
	flowPayPal: function () {
		if (this.model.currentStep !== 'start') {
			this.errorMessage = 'The current flow will be abandoned...';
			setTimeout(this.newFlow, 500);
		}

		dom.addClass(this.query('.flow-paypal'), 'show');
		dom.removeClass(this.query('.flow-paypal'), 'hidden');
		dom.addClass(this.query('.flow-stripe'), 'hidden');
		dom.removeClass(this.query('.flow-stripe'), 'show');
		this.queryByHook('stepOne').Collapse.show();
	},
	flowStripe: function () {
		if (this.model.currentStep !== 'start') {
			this.newFlow();
		}
	},
	newFlow: function () {
		app.router.reload();
	},
	nextStep: function () {
		this.queryByHook(this.model.currentStep).Collapse.show();
	},
	subviews: {
		payPalExpressForm: {
			hook: 'paypal-express-form',
			waitFor: 'model',
			prepareView: function (el) {
				var model = this.model;
				return new PayPalExpressForm({
					el: el,
					model: this.model,
					submitCallback: function (data) {
						data.currentStep = 'stepTwo';
						data.paymentMethod = 'paypal-express';
						this.model.set(data);
						this.parent.nextStep();
					}
				});
			}
		},
		payPalExpressConfirm: {
			hook: 'paypal-express-confirm',
			waitFor: 'model.committedPayment',
			prepareView: function (el) {
				return new PayPalExpressConfirm({
					el: el,
					model: this.model,
					submitCallback: function (data) {
						//clear this payment and go to step 1
						this.parent.newFlow();
					}
				});
			}
		}
	},
	postRender: function () {
		this.paypalButtonRender();
	},
	paypalButtonRender: function () {
		var paypalButtonContainer = this.queryByHook('pp-button-container');
		if (!paypalButtonContainer) {
			setTimeout(this.paypalButtonRender, 100);
			return;
		} else {
			if (!window.paypal) {
				return;
			}

			var model = this.model;
			var view = this;
			window.paypal.Button.render({
				env: app.debugMode ? 'sandbox' : 'production',
				commit: true,
				payment: function() {
					if (model.currentStep !== 'end') {
						return window.fetch(app.apiBaseUri + '/v1/payments',
							app.fetchMerge({
								method: 'POST',
								body: JSON.stringify(model)
							})
						).then(function (response) {
							if (response.ok) {
								if (response.headers.has('X-MUK-REFRESH-TOKEN')) {
									app.me.token = response.headers.get('X-MUK-REFRESH-TOKEN');
								}
								return response.json();
							} else if (response.status === 401) {
								app.me.token = '';
								app.router.redirectTo(app.contextPath + 'login');
							} else {
								throw new Error('Unexpected status: ' + response.status);
							}
						}).then(function (body) {
							if (body.state && body.state === 'created') {
								return body.paymentId;
							} else {
								throw new Error('Invalid State: ' + body.state);
							}
						}).catch(function (error) {
							view.errorMessage = error.message;
						});
					} else {
						return Promise.reject(new Error('This checkout is done.')).catch(function(error) {
							view.errorMessage = error.message;
						});
					}
				},
				onAuthorize: function(data, actions) {
					return window.fetch(app.apiBaseUri + '/v1/payments/' + data.paymentID,
						app.fetchMerge({
							method: 'PATCH',
							body: JSON.stringify({
								stateChange: 'execute',
								pathChanges: [
									['.paymentMethod', '"' + model.paymentMethod + '"'],
									['.payerId', '"' + data.payerID + '"']
								]
							}),
						})
					).then(function (response) {
						if (response.ok) {
							if (response.headers.has('X-MUK-REFRESH-TOKEN')) {
								app.me.token = response.headers.get('X-MUK-REFRESH-TOKEN');
							}

							model.currentStep = "end";
							model.committedPayment = {service: 'future api call for payment', price: 9.99};
							view.errorMessage = "Thanks! This checkout is done."
							view.nextStep();
						} else {
							var message = '' + response.status + ': ';
							var body = response.json();
							if (body) {
								message += body.message;
							}

							throw new Error('Unexpected status: ' + message);
						}
					}).catch(function (error) {
						view.errorMessage = error.message;
					});
				}
			}, '#' + paypalButtonContainer.id);
		}
	}
});
