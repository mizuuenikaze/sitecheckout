/*
 * Base model for local storeage use and never syncs to server.
 */
var AmpersandModel = require('ampersand-model');
var debounce = require('debounce');
var _ = require('lodash');

module.exports = AmpersandModel.extend({
	session: {
		STORAGE_KEY: ['string', true, ''],
		loaded: ['boolean', true, false]
	},
	writeToLocalStorage: function () {
		if (this.STORAGE_KEY !== '' && this.loaded) {
			localStorage[this.STORAGE_KEY] = JSON.stringify(this);
		}
	},
	readFromLocalStorage: function () {
		var existingData = localStorage[this.STORAGE_KEY];
		if (existingData) {
			this.set(_.assign({}, JSON.parse(existingData), {STORAGE_KEY: this.STORAGE_KEY, loaded: true}));
		}
	},
	handleStorageEvent: function (event) {
		if (event.key === this.STORAGE_KEY) {
			this.readFromLocalStorage();
		}
	},
	load: function () {
		this.readFromLocalStorage();
		this.loaded = true;
		this.on('all', this.writeToLocalStorage, this);
	},
	initialize: function (attrs) {
		this.writeToLocalStorage = debounce(this.writeToLocalStorage, 100);
		window.addEventListener('storage', this.handleStorageEvent.bind(this));

		if (this.STORAGE_KEY !== '') {
			this.load();
		}
	}
});
