var PaymentFlowView = require('./paymentFlow');
var templates = require('../templates');
var StripeForm = require('../forms/stripeForm');
var StripeConfirm = require('../forms/stripeConfirm');
var app = require('ampersand-app');



module.exports = PaymentFlowView.extend({
	template: templates.includes.stripeFlow,
	events: {
		'click [data-hook=stripebutton]': 'payment'
	},
	subviews: {
		paymentForm: {
			hook: 'payment-form',
			waitFor: 'model',
			prepareView: function (el) {
				var model = this.model;
				return new StripeForm({
					el: el,
					model: this.model,
					submitCallback: this.tokenizeCCAndSubmit
				});
			}
		},
		paymentConfirm: {
			hook: 'payment-confirm',
			waitFor: 'model.committedPayment',
			prepareView: function (el) {
				return new StripeConfirm({
					el: el,
					model: this.model,
					submitCallback: this.paymentConfirmSubmitCallback
				});
			}
		}
	},
	integrateUi: function () {
		PaymentFlowView.prototype.integrateUi.apply(this, arguments);

		var stripeFormContainer = this.queryByHook('card-element');

		if (!window.Stripe) {
			return;
		}

		this.stripe = Stripe(app.stripeKey);
		var elements = this.stripe.elements();
		this.card = elements.create('card');
		this.card.mount('#' + stripeFormContainer.id);
		this.displayError = this.queryByHook('card-errors');

		this.card.addEventListener('change', function(event) {
			if (event.error) {
				app.currentPage.paymentFlow.current.displayError.textContent = event.error.message;
			} else {
				app.currentPage.paymentFlow.current.displayError.textContent = '';
			}
		});
	},
	tokenizeCCAndSubmit: function (data) {
		var view = this.parent;
		this.parent.stripe.createToken(this.parent.card).then(function (result) {
			if (result.error) {
				view.displayError.textContext = result.error.message;
			} else {
				data.info = result.token.id;
				view.paymentFormSubmitCallback(data);
			}
		});
	},
	payment: function () {
		if (this.model.currentStep !== 'end') {
			var model = this.model;
			var view = this;
			return window.fetch(app.apiBaseUri + '/v1/payments',
				app.fetchMerge({
					method: 'POST',
					body: JSON.stringify(this.model)
				})
			).then(app.peelFetchResponse
			).then(view.handlePaymentsResponse
			).then(function (paymentId) {
				model.currentStep = 'end';
				model.committedPayment = {service: 'future api call for payment', price: 9.99};
				app.currentPage.errorMessage = 'Thanks! This checkout is done.'
				app.currentPage.nextStep();
			}).catch(app.handleError);
		} else {
			return Promise.reject(new Error('This checkout is done.')).catch(app.handleError);
		}
	}
});
