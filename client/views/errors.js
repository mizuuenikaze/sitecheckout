var View = require('ampersand-view');
var templates = require('../templates');
var app = require('ampersand-app');

var showView = function (el, value, previousValue) {
	if (value && value !== '') {
		el.querySelector('[data-toggle=collapse]').Collapse.show();
	}
};

module.exports = View.extend({
	template: templates.includes.errors,
	events: {
		'hide.bs.collapse [data-hook=error-container-final]': 'clearErrors'
	},
	bindings: {
		'model.errorMessage': [
			{type: 'text', hook: 'error-message'},
			{type: showView, hook: 'error-container-final'}
		]
	},
	clearErrors: function () {
		this.model.clear({silent: true});
	}
});

