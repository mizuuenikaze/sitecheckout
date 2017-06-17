var dom = require('ampersand-dom');
var PageView = require('./base');
var ViewSwitcher = require('ampersand-view-switcher');
var templates = require('../templates');
var PayPalFlow = require('../views/payPalFlow');
var StripeFlow = require('../views/stripeFlow');
var app = require('ampersand-app');


module.exports = PageView.extend({
    pageTitle: 'checkout',
    template: templates.pages.checkout,
	events: {
		'click [data-hook=paywithpaypal]': 'flowPayPal',
		'click [data-hook=paywithstripe]': 'flowStripe'
	},
	initialize: function () {
		this.listenTo(app, 'externalReady', this.setupPaymentTypes);

		// always start with a clean model
		this.model.unset('service');
		this.model.unset('price');
		this.model.unset('committedPayment');
		this.model.unset('paymentMethod');
		this.model.unset('paymentId');
		this.model.unset('payerId');
		this.model.unset('currentStep');
	},
	render: function () {
		this.renderWithTemplate(this);
		this.paymentFlow = new ViewSwitcher(this.queryByHook('paymentFlow'), {
			show: function (newView) {
				newView.integrateUi();
				newView.queryByHook('stepOne').Collapse.show();
			}
		});
	},
	flowPayPal: function () {
		if (this.model.currentStep !== 'start') {
			this.errorMessage = 'The current flow will be abandoned...';
			setTimeout(this.newFlow, 500);
		}

		this.paymentFlow.set(new PayPalFlow({model: this.model, paymentMethod: 'paypal-express'}));
	},
	flowStripe: function () {
		if (this.model.currentStep !== 'start') {
			this.errorMessage = 'The current flow will be abandoned...';
			setTimeout(this.newFlow, 500);
		}

		this.paymentFlow.set(new StripeFlow({model: this.model, paymentMethod: 'stripe'}));
	},
	newFlow: function () {
		app.router.reload();
	},
	nextStep: function () {
		this.queryByHook(this.model.currentStep).Collapse.show();
	},
	setupPaymentTypes: function () {
		dom.removeAttribute(this.queryByHook('paywithpaypal'), 'disabled');
		dom.removeAttribute(this.queryByHook('paywithstripe'), 'disabled');
	}
});
