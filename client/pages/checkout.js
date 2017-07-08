var dom = require('ampersand-dom');
var PageView = require('./base');
var ViewSwitcher = require('ampersand-view-switcher');
var templates = require('../templates');
var PayPalFlow = require('../views/payPalFlow');
var StripeFlow = require('../views/stripeFlow');
var app = require('ampersand-app');
var _ = require('lodash');


module.exports = PageView.extend({
    pageTitle: 'checkout',
    template: templates.pages.checkout,
	cmsId: '1b4502d6a9a5485c8317e4965fcb6926',
	events: {
		'click [data-hook~=paywithpaypal]': 'flowPayPal',
		'click [data-hook~=paywithstripe]': 'flowStripe'
	},
	bindings: _.extend({}, PageView.prototype.bindings, {
		'model.cms.page.a.a': {type: 'text', hook: 'outl-a.a'},
		'model.cms.page.a.b': {type: 'text', hook: 'outl-a.b'},
		'model.cms.page.a.c': {type: 'text', hook: 'outl-a.c'}
	}),
	initialize: function (attrs) {
		this.listenTo(app, 'externalReady', this.setupPaymentTypes);

		// always start with a clean model
		this.model.payment.unset('service');
		this.model.payment.unset('price');
		this.model.payment.unset('committedPayment');
		this.model.payment.unset('paymentMethod');
		this.model.payment.unset('paymentId');
		this.model.payment.unset('payerId');
		this.model.payment.unset('currentStep');
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
		if (this.model.payment.currentStep !== 'start') {
			this.errorMessage = 'The current flow will be abandoned...';
			setTimeout(this.newFlow, 1000);
		}

		this.paymentFlow.set(new PayPalFlow({model: this.model.payment, paymentMethod: 'paypal-express'}));
	},
	flowStripe: function () {
		if (this.model.payment.currentStep !== 'start') {
			this.errorMessage = 'The current flow will be abandoned...';
			setTimeout(this.newFlow, 1000);
		}

		this.paymentFlow.set(new StripeFlow({model: this.model.payment, paymentMethod: 'stripe'}));
	},
	newFlow: function () {
		app.router.reload();
	},
	nextStep: function () {
		this.queryByHook(this.model.payment.currentStep).Collapse.show();
	},
	setupPaymentTypes: function () {
		dom.removeAttribute(this.queryByHook('paywithpaypal'), 'disabled');
		dom.removeAttribute(this.queryByHook('paywithstripe'), 'disabled');
	}
});
