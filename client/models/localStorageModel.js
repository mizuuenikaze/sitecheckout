/*
 * Base model for local storeage use and never syncs to server.
 */
var AmpersandModel = require('ampersand-model');
var debounce = require('debounce');

module.exports = AmpersandModel.extend({
	session: {
		STORAGE_KEY: ['string', true, '']
	},
	writeToLocalStorage: function () {
		localStorage[this.STORAGE_KEY] = JSON.stringify(this);
	},
	readFromLocalStorage: function () {
		var existingData = localStorage[this.STORAGE_KEY];
		if (existingData) {
			this.set(JSON.parse(existingData));
		}
	},
	handleStorageEvent: function (event) {
		if (event.key === this.STORAGE_KEY) {
			this.readFromLocalStorage();
		}
	},
	initialize: function () {
		this.readFromLocalStorage();
		this.writeToLocalStorage = debounce(this.writeToLocalStorage, 100);

		this.on('all', this.writeToLocalStorage, this);
		
		window.addEventListener('storage', this.handleStorageEvent.bind(this));
	}
});
