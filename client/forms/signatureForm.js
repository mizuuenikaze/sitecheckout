var FormView = require('ampersand-form-view');
var CheckboxView = require('ampersand-checkbox-view');
var templates = require('../templates');
var ExtendedCheckInput = CheckboxView.extend({
	template: templates.includes.checkboxInput()
});


module.exports = FormView.extend({
	events: {
		'click input[type=checkbox][name=accept-sig]': 'autosubmit'
	},
	fields: function () {
		return [
			new ExtendedCheckInput({
				label: 'Accept Signature',
				name: 'accept-sig',
				value: false,
				required: false,
				tabindex: 1,
				parent: this
			})
		];
	},
	autosubmit: function (e) {
		var scFun = this.submitCallback.bind(this.parent);
		scFun(this.data);
	}
});
