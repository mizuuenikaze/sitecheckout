var FormView = require('ampersand-form-view');
var InputView = require('ampersand-input-view');
var templates = require('../templates');
var ExtendedInput = InputView.extend({
	template: templates.includes.formInput()
});


module.exports = FormView.extend({
    fields: function () {
        return [
            new ExtendedInput({
                label: 'Username',
                name: 'username',
                value: this.model && this.model.username,
                required: true,
                placeholder: 'Username',
                parent: this
            }),
            new ExtendedInput({
                label: 'Password',
                name: 'password',
                value: this.model && this.model.password,
				type: 'password',
                required: true,
                placeholder: 'Password',
                parent: this
            })
        ];
    }
});
