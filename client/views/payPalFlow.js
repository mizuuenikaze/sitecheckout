var PaymentFlowView = require('./paymentFlow');
var templates = require('../templates');
var PayPalExpressForm = require('../forms/payPalExpressForm');
var PayPalExpressConfirm = require('../forms/payPalExpressConfirm');
var app = require('ampersand-app');



module.exports = PaymentFlowView.extend({
	template: templates.includes.payPalFlow,
	subviews: {
		paymentForm: {
			hook: 'payment-form',
			waitFor: 'model',
			prepareView: function (el) {
				var model = this.model;
				return new PayPalExpressForm({
					el: el,
					model: this.model,
					submitCallback: this.paymentFormSubmitCallback
				});
			}
		},
		paymentConfirm: {
			hook: 'payment-confirm',
			waitFor: 'model.committedPayment',
			prepareView: function (el) {
				return new PayPalExpressConfirm({
					el: el,
					model: this.model,
					submitCallback: this.paymentConfirmSubmitCallback
				});
			}
		}
	},
	integrateUi: function () {
		PaymentFlowView.prototype.integrateUi.apply(this, arguments);

		var paypalButtonContainer = this.queryByHook('pp-button-container');

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
					).then(app.peelFetchResponse
					).then(view.handlePaymentsResponse
					).catch(app.handleError);
				} else {
					return Promise.reject(new Error('This checkout is done.')).catch(app.handleError);
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
				).then(app.peelFetchResponse
				).then(function (body) {
					model.currentStep = 'end';
					model.committedPayment = {service: 'future api call for payment', price: 9.99};
					app.currentPage.errorMessage = 'Thanks! This checkout is done.';
					app.currentPage.nextStep();
				}).catch(app.handleError);
			}
		}, '#' + paypalButtonContainer.id);
	}
});
