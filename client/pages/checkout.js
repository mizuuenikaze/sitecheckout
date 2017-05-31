var dom = require('ampersand-dom');
var PageView = require('./base');
var templates = require('../templates');
var PayPalExpressForm = require('../forms/payPalExpressForm');
var app = require('ampersand-app');


module.exports = PageView.extend({
    pageTitle: 'checkout',
    template: templates.pages.checkout,
	events: {
		'click [data-hook=paywithpaypal]': 'flowPayPal',
		'click [data-hook=paywithstripe]': 'flowStripe'
	},
	bindings: {
		'model.errorMessage': [{
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
	},
	flowPayPal: function () {
		dom.addClass(this.query('.flow-paypal'), 'show');
		dom.removeClass(this.query('.flow-paypal'), 'hidden');
		dom.addClass(this.query('.flow-stripe'), 'hidden');
		dom.removeClass(this.query('.flow-stripe'), 'show');
		this.queryByHook('stepOne').Collapse.show();
	},
	flowStripe: function () {
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
			window.paypal.Button.render({
				env: app.debugMode ? 'sandbox' : 'production',
				commit: true,
				payment: function() {
					return window.fetch(app.apiBaseUri + '/v1/payments',
						app.fetchMerge({
							method: 'post',
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
						model.errorMessage = error.message;
					});
				},
				onAuthorize: function(data, actions) {
					console.log('authorized');

				}
			}, '#' + paypalButtonContainer.id);
		}
	}
});
