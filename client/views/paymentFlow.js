var View = require('ampersand-view');
var app = require('ampersand-app');


/*
 * Payment flow views are always used in the checkout page and thus
 * referenced as app.currentPage.
 */
module.exports = View.extend({
	props: {
		paymentMethod: ['string', true, 'N/A']
	},
	paymentFormSubmitCallback: function (data) {
		data.currentStep = 'stepTwo';
		data.paymentMethod = this.paymentMethod ? this.paymentMethod : this.parent.paymentMethod;
		this.model.set(data);
		app.currentPage.nextStep();
	},
	paymentConfirmSubmitCallback: function(data){
		//clear this payment and go to step 1
		app.currentPage.newFlow();
	},
	integrateUi: function () {
		// flow UIs are delayed so force a bootstrap update
		app.mainView.updateBootstrapUi(this.el);
	},
	handlePayments: function (response) {
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
	},
	handlePaymentsResponse: function (body) {
		if (body.state && body.state === 'created') {
			return body.paymentId;
		} else {
			throw new Error('Invalid State: ' + body.state);
		}
	},
	handleError: function (error) {
		app.currentPage.errorMessage = error.message;
	}
});
