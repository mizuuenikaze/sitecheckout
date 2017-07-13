/*global $*/
// base view for pages
var View = require('ampersand-view');
var app = require('ampersand-app');
//var _ = require('lodash');
//var key = require('keymaster');


module.exports = View.extend({
	// common view properties
	props: {
		errorMessage: 'string'
	},
	bindings: {
		'errorMessage': [{
			type: 'text',
			hook: 'error-message'
		},{
			type: 'booleanClass',
			hook: 'error-message',
			yes: 'show',
			no: 'hidden'
		}]
	},
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
	postRender: function() {
		return app.thirdPartyWait();
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
		app.currentPage.errorMessage = error.message;
	}
});
