var FormView = require('ampersand-form-view');
var InputView = require('ampersand-input-view');


module.exports = FormView.extend({
    fields: function () {
        return [
            new InputView({
                label: 'Username',
                name: 'username',
                value: this.model && this.model.username,
                required: true,
                placeholder: 'Username',
                parent: this
            }),
            new InputView({
                label: 'Password',
                name: 'password',
                value: this.model && this.model.password,
                required: true,
                placeholder: 'Password',
                parent: this
            })
        ];
    }
});
