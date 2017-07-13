var AmpersandModel = require('ampersand-model');
var app = require('ampersand-app');


module.exports = AmpersandModel.extend({
	props: {
		id: ['string', 'true', ''],
		page: 'object'
	},
	initialize: function (attrs) {
		this.ajaxConfig = app.configureAjax.bind(app);
		this.urlRoot = app.apiBaseUri + '/v1/cms';
	}
});
