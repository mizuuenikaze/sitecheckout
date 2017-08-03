var dom = require('ampersand-dom');
var PageView = require('./base');
var ViewSwitcher = require('ampersand-view-switcher');
var templates = require('../templates');
var PayPalFlow = require('../views/payPalFlow');
var StripeFlow = require('../views/stripeFlow');
var ChargeConfirm = require('../views/chargeConfirm');
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
		// always start with a clean model
		this.model.payment.unset([
			'service',
			'price',
			'committedPayment',
			'paymentMethod',
			'paymentId',
			'payerId',
			'currentStep',
			'info',
			'metadata']);
	},
	render: function () {
		this.renderWithTemplate(this);
		this.paymentFlow = new ViewSwitcher(this.queryByHook('paymentFlow'), {
			show: function (newView) {
				newView.integrateUi();
				newView.queryByHook('stepOne').Collapse.show();
			}
		});

		return this;
	},
	subviews: {
		confirmPanel: {
			hook: 'charge-confirm',
			waitFor: 'model',
			prepareView: function (el) {
				var model = this.model;
				return new ChargeConfirm({
					el: el,
					model: this.model.payment
				});
			}
		}
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
	bindUiTo: function (external) {
		if (external === 'paypal') {
			dom.removeAttribute(this.queryByHook('paywithpaypal'), 'disabled');
		}

		if (external === 'stripe') {
			dom.removeAttribute(this.queryByHook('paywithstripe'), 'disabled');
		}
	}
});
