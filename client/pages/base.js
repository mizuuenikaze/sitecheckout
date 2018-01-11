/*global $*/
// base view for pages
var View = require('ampersand-view');
var app = require('ampersand-app');
var ErrorView = require('../views/errors');
var ErrorMessage = require('../models/error');
//var _ = require('lodash');
//var key = require('keymaster');
var errorContainerHook = 'error-container';

module.exports = View.extend({
	autoRender: false,
	// register keyboard handlers
	registerKeyboardShortcuts: function() {
		/*
		var self = this;
		_.each(this.keyboardShortcuts, function (value, k) {
			// register key handler scoped to this page
			key(k, self.cid, _.bind(self[value], self));
		});
		key.setScope(this.cid);
		*/
	},
	unregisterKeyboardShortcuts: function() {
		//key.deleteScope(this.cid);
	},
	render: function () {
		this.renderWithTemplate(this);


		var model = new ErrorMessage();
		this.errorContainerView = this.renderSubview(new ErrorView({
			model: model
		}), this.queryByHook(errorContainerHook));
	},
	postRender: function () {
		// override for special needs in extended pages
		return true;
	},
	bindUiTo: function (external) {
		//third party dom bindings
		return true;
	},
	cmsFetch: function (options) {
		if (this.cmsId) {
			this.model.cms.clear();
			this.model.cms.id = this.cmsId;
			this.model.cms.fetch(options);
		} else {
			options.success(null, null, options);
		}
	},
	handleError: function (error) {
		app.currentPage.setErrorMessage(error.messsage);
	},
	setErrorMessage: function (content) {
		this.errorContainerView.model.errorMessage = content;
	}
});
