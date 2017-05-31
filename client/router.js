var app = require('ampersand-app');
var Router = require('ampersand-router');
var CheckoutPage = require('./pages/checkout');
var LoginPage = require('./pages/login');

module.exports = Router.extend({
    routes: {
        'checkout/': 'home',
        'checkout/login': 'login',
        '(*path)': 'catchAll'
    },

    // ------- ROUTE HANDLERS ---------
    home: function () {
		if (app.me.token !== '') {
			app.trigger('page', new CheckoutPage({
				model: app.payment
			}));
		} else {
			app.navigate(app.contextPath + 'login');
		}
	},
	login: function () {
		app.trigger('page', new LoginPage({
			model: app.me
		}));
	},

    catchAll: function () {
		if (app.me.token !== '') {
        	this.redirectTo(app.contextPath + 'login');
		} else {
			this.redirectTo(app.contextPath + '');
		}
    }
});
