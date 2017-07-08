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
		if (app.pageContext.me.token !== '') {
			app.trigger('page', new CheckoutPage({
				model: app.pageContext
			}));
		} else {
			this.navigate(app.contextPath + 'login', {trigger: false});
			this.login();
			return false;
		}
	},
	login: function () {
		app.trigger('page', new LoginPage({
			model: app.pageContext
		}));
	},

    catchAll: function () {
		if (app.pageContext.me.token !== '') {
        	this.redirectTo(app.contextPath + 'login');
		} else {
			this.redirectTo(app.contextPath + '');
		}
    }
});
