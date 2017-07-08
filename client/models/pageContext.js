/*
 * PageContext
 * Composite model consiting of:
 * 	1. Me - user info
 * 	2. Cms - couchdb page content.
 * 	3. Payment - structure for payment apis.
 */

var AmpersandModel = require('ampersand-model');
var Me = require('./me');
var Cms = require('./cms');
var Payment = require('./payment');

module.exports = AmpersandModel.extend({
	children: {
		me: Me,
		cms: Cms,
		payment: Payment
	},
	initialize: function (options) {
		this.set({me: {STORAGE_KEY: 'mukuser_v1'}});
		this.me.load();
		this.set({payment: {STORAGE_KEY: 'mukpayment_v1'}});
		this.payment.load();
	}
});
