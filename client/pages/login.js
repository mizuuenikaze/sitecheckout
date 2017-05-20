var app = require('ampersand-app');
var PageView = require('./base');
var tempalates = require('../templates');
var LoginForm = require('../forms/login');


module.exports = PageView.extend({
	pageTitle: 'login',
	template: templates.pages.login,
	subviews: {
		form: {
			hook: 'login-form',
			waitFor: 'model',
			prepareView: function (el) {
				var model = this.model;
				return new LoginForm({
					el: el,
					model: this.model,
					submitCallback: function (data) {
						model.save(data, {
							wait: true,
							success: function () {
								app.navigate('./');
							}
						});
					}
				});
			}
		}
	}
});
