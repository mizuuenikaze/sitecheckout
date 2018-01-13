var PaymentFlowView = require('./paymentFlow');
var templates = require('../templates');
var StripeForm = require('../forms/stripeForm');
var StripeConfirm = require('../forms/stripeConfirm');
var SignatureForm = require('../forms/signatureForm');
var app = require('ampersand-app');
var CanvasUtil = require('../util/canvasDraw');
var _ = require('lodash');


module.exports = PaymentFlowView.extend({
	template: templates.includes.stripeFlow,
	events: {
		'click [data-hook=stripebutton]': 'payment',
		'touchstart [data-hook=sig]': 'touchStart',
		'touchmove [data-hook=sig]': 'touchMove',
		'touchend [data-hook=sig]': 'touchEnd',
		'mousedown [data-hook=sig]': 'mouseDown',
		'mouseup [data-hook=sig]': 'mouseUp',
		'mousemove [data-hook=sig]': 'mouseMove'
	},
	initialize: function (attrs) {
		this.canvasDraw = new CanvasUtil();
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
		},
		signatureForm: {
			hook: 'sig-check',
			waitFor: 'model',
			prepareView: function (el) {
				return new SignatureForm({
					el: el,
					model: this.model,
					submitCallback: this.acceptSignature
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
					body: JSON.stringify(_.assign({}, JSON.parse(JSON.stringify(this.model)), {metadata: this.model.metadata}))
				})
			).then(app.peelFetchResponse
			).then(view.handlePaymentsResponse
			).then(function (paymentId) {
				model.currentStep = 'end';
				model.committedPayment = {service: 'future api call for payment', price: 9.99};
				app.currentPage.setErrorMessage('Thanks! This checkout is done.');
				app.currentPage.nextStep();
			}).catch(app.handleError);
		} else {
			return Promise.reject(new Error('This checkout is done.')).catch(app.handleError);
		}
	},
	acceptSignature: function (data) {
		var canvas = this.queryByHook('sig');

		// strange opposite polarity
		if(!data['accept-sig']) {
			var png = canvas.toDataURL();
			var metadata = [];
			var index = 0;

			while (png.length >= 500) {
				metadata.push(['md' + index, png.substring(0, 500)]);
				png = png.slice(500);
				index = index + 1;
			}
			
			if (png.length > 0) {
				metadata.push(['md' + index, png]);
			}

			this.model.metadata = metadata;
		} else {
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		}
	},
	/* canvas event handlers */
	modifyContext: function(context){
		context.stokeStyle = '#ff0000';
		context.lineJoin = 'round';
		context.lineWidth = 3;

		return context;
	},
	touchStart: function (e) {
		var sig = this.queryByHook('sig');
		return this.canvasDraw.touchStart(this.modifyContext(sig.getContext('2d')), e);
	},
	touchMove: function (e) {
		var sig = this.queryByHook('sig');
		return this.canvasDraw.touchMove(this.modifyContext(sig.getContext('2d')), e);
	},
	touchEnd: function (e) {
		var sig = this.queryByHook('sig');
		return this.canvasDraw.endSegment(sig.getContext('2d'));
	},
	mouseDown: function (e) {
		var sig = this.queryByHook('sig');
		return this.canvasDraw.mouseDown(this.modifyContext(sig.getContext('2d')), e);
	},
	mouseMove: function (e) {
		var sig = this.queryByHook('sig');
		return this.canvasDraw.mouseMove(this.modifyContext(sig.getContext('2d')), e);
	},
	mouseUp: function (e) {
		var sig = this.queryByHook('sig');
		return this.canvasDraw.endSegment(sig.getContext('2d'));
	}
});
