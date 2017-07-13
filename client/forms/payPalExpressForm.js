var FormView = require('ampersand-form-view');
var InputView = require('ampersand-input-view');
var templates = require('../templates');
var _ = require('lodash');
var ExtendedInput = InputView.extend({
	template: templates.includes.formInput()
});
var ExtendedNumberInput = InputView.extend({
	template: templates.includes.formInput(),
	props: {
		step: ['string', true, 'any']
	},
	bindings: _.extend({}, InputView.prototype.bindings, {
		'step': {
			type: 'attribute',
			selector: 'input, textarea',
			name: 'step'
		}
	})
});


module.exports = FormView.extend({
	fields: function () {
		return [
			new ExtendedInput({
				label: 'Service',
				name: 'service',
				value: '',
				required: true,
				placeholder: 'swedish massage',
				parent: this
			}),
			new ExtendedNumberInput({
				label: 'Price',
				name: 'price',
				value: '',
				type: 'number',
				step: 'any',
				required: true,
				placeholder: '60.00',
				parent: this
			})
		];
	}
});
