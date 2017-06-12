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
	initialize: function () {
		this.listenTo(app, 'externalReady', this.setupModal);
	},
	setupModal: function () {
		this.approveModal = new app.bootstrapComponents.Modal(this.queryByHook('approve'),{backdrop: 'static'});
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
						view.errorMessage = err.message;
					} if (response.statusCode > 299) {
						view.errorMessage = response.status + ": " + body.message;
					} else {
						view.authenticateUser(body);
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
						view.errorMessage = err.message;
					}
				});
			}
		});
	},
	authenticateUser: function (userInfo) {
		this.model.set(userInfo);
		this.approveModal.hide();
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
								parentView.errorMessage = err.message;
							} else {
								if (response.statusCode > 299) {
									parentView.errorMessage = response.statusCode + ': ' + body.message;
								} else if (body.links) {
									parentModel.hateoas = body.links;
									parentView.approveModal.show();
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
