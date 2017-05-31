var app = require('ampersand-app');
var PageView = require('./base');
var templates = require('../templates');
var LoginForm = require('../forms/login');
var xhr = require('xhr');
var _ = require('lodash');

var mergeXhrOptions = function (options) {
	var superConfig = app.configureAjax();
	var requestOptions = _.merge({
		useXDR: superConfig.useXDR,
		headers: superConfig.headers,
		method: 'get',
		withCredentials: true
	}, options);

	return requestOptions;
}

module.exports = PageView.extend({
	pageTitle: 'login',
	template: templates.pages.login,
	events: {
		'click [data-hook=confirm]': 'confirmApproval',
		'click [data-hook=deny]': 'denyApproval',
	},
	confirmApproval: function () {
		var view = this;
		_.map(this.model.hateoas, function (link) {
			if (link.rel === 'confirm') {
				// call approval
				xhr(mergeXhrOptions({
					url: link.href,
					method: 'get'
				}), function (err, response, body) {
					if (err) {
						view.queryByHook('messages').textContent = response.status + ": " + err.message;
					} else {
						this.authenticateUser(body);
					}
				});
			}
		});
	},
	denyApproval: function () {
		var view = this;
		_.map(this.model.hateoas, function (link) {
			if (link.rel === 'deny') {
				// call deny
				xhr(mergeXhrOptions({
					url: link.href,
					method: 'get'
				}), function (err, response, body) {
					if (err) {
						view.queryByHook('messages').textContent = response.status + ": " + err.message;
					}
				});
			}
		});
	},
	authenticateUser: function (userInfo) {
		this.model.set(userInfo);
		app.navigate(app.contextPath);
	},
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
						data.clientId = 'mukapi';
						var parentModel = this.model;
						var parentView = this.parent;
						// call login
						xhr(mergeXhrOptions({
							url: app.apiBaseUri + '/admin/login',
							method: 'post',
							json: data
						}), function (err, response, body) {
							if (err) {
								alert(err.message);
							} else {
								if (body.links) {
									parentModel.hateoas = body.links;
									var modalInstance = new app.bootstrapComponents.Modal(parentView.queryByHook('approve'),{backdrop: 'static'});
									modalInstance.show();
								} else {
									parentView.authenticateUser(body);
								}
							}
						});
					}
				});
			}
		}
	}
});
