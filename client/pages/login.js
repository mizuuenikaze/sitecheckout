var app = require('ampersand-app');
var PageView = require('./base');
var templates = require('../templates');
var LoginForm = require('../forms/login');
var _ = require('lodash');


module.exports = PageView.extend({
	pageTitle: 'login',
	template: templates.pages.login,
	events: {
		'click [data-hook=confirm]': 'confirmApproval',
		'click [data-hook=deny]': 'denyApproval'
	},
	bindUiTo: function (external) {
		if (external === 'bootstrap') {
			this.approveModal = new window.Modal(this.queryByHook('approve'),{backdrop: 'static'});
		}
	},
	postRender: function () {
		// Always clear any token
		app.pageContext.me.token = '';
	},
	confirmApproval: function () {
		var view = this;
		Promise.all(
			_.map(this.model.me.hateoas, function (link) {
				if (link.rel === 'confirm') {
					// call approval
					return window.fetch(link.href, app.configureFetch()
					).then(app.peelFetchResponse
					).then(function (body) {
						view.authenticateUser(body);
					});
				} else {
					Promise.resolve(true);
				}
			})
		).catch(app.handleError);
	},
	denyApproval: function () {
		Promise.all(
			_.map(this.model.me.hateoas, function (link) {
				if (link.rel === 'deny') {
					// call deny
					return window.fetch(link.href, app.configureFetch()).then(app.peelFetchResponse);
				} else {
					Promise.resolve(true);
				}
			})
		).catch(app.handleError);
	},
	authenticateUser: function (userInfo) {
		this.model.me.set(userInfo);

		if (this.approveModal) {
			this.approveModal.hide();
		}

		app.navigate(app.contextPath);
	},
	subviews: {
		form: {
			hook: 'login-form',
			waitFor: 'model',
			prepareView: function (el) {
				return new LoginForm({
					el: el,
					model: this.model.me,
					submitCallback: function (data) {
						data.clientId = 'mukapi';
						var parentModel = this.model;
						var parentView = this.parent;
						// call login
						return window.fetch(app.apiBaseUri + '/admin/login',
							app.fetchMerge({
								method: 'POST',
								body: JSON.stringify(data)
							})
						).then(app.peelFetchResponse
						).then(function (body) {
							if (body.links) {
								parentModel.hateoas = body.links;

								if (!parentView.approveModal) {
									throw new Error('Modal not ready.');
								}

								parentView.approveModal.show();
							} else {
								parentView.authenticateUser(body);
							}
						}).catch(app.handleError);
					}
				});
			}
		}
	}
});
