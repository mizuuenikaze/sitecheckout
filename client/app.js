var app = require('ampersand-app');
var _ = require('lodash');
var config = require('clientconfig');
var Router = require('./router');
var MainView = require('./views/main');
var PageContext = require('./models/pageContext');
var domReady = require('domready');
var browser = require('detect-browser');
var scriptLoad = require('scriptloader');

// Defer lazysizes
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.init = false;
window.lazySizesConfig.customMedia = {
	'--small': '(max-width: 480px)',
	'--medium': '(max-width: 700px)',
	'--large': '(max-width: 1400px)'
}
var lazysizes = require('./util/lazysizes');

// attach our app to `window` so we can
// easily access it from the console.
window.app = app;

// Extends our main app singleton
app.extend({
	contextPath: window.location.pathname.match(/(\/[^\/]+){1}/, '')[0] + '/',
	stripeKey: config.stripe,
	apiBaseUri: config.apiUrl,
	debugMode: config.debugMode,
	gaua: config.gaua,
	router: new Router(),
	// This is where it all starts
	init: function() {
		this.pageContext = new PageContext();

		// Create and attach our main view
		this.mainView = new MainView({
			model: this.pageContext.me,
			el: document.body
		});

		// this kicks off our backbutton tracking (browser history)
		// and will cause the first matching handler in the router
		// to fire.
		this.router.history.start([{ pushState: true},{root: this.contextPath}]);
	},
	// This is a helper for navigating around the app.
	// this gets called by a global click handler that handles
	// all the <a> tags in the app.
	// it expects a url pathname for example: "/costello/settings"
	navigate: function(page) {
		var url = (page.charAt(0) === '/') ? page.slice(1) : page;
		this.router.history.navigate(url, {
			trigger: true
		});
	},
	configureAjax: function () {
		var useXDR = /IE/.test(browser.name);
		var headers = {'Accept': 'application/json'};
		var xhrFields = {withCredentials: false};

		if (this.pageContext.me.token !== '') {
			headers.Authorization = 'Bearer ' + this.pageContext.me.token;
			xhrFields.withCredentials = true;
		}

		return { useXDR: useXDR, headers: headers, xhrFields: xhrFields };
	},
	configureFetch: function () {
		var headers = new Headers();
		var url = new URL(window.location.href);
		var method = 'GET';
		var mode = 'same-origin';
		var credentials = 'same-origin';
		var redirect = 'error';

		if (this.apiBaseUri !== url.origin) {
			mode = 'cors';
			credentials = 'include';
		}

		headers.append('Accept', 'application/json');
		headers.append('Content-Type', 'application/json');

		if (this.pageContext.me.token !== '') {
			headers.append('Authorization', 'Bearer ' + this.pageContext.me.token);
		}

		return {method: method, mode: mode, redirect: redirect, credentials: credentials, headers: headers};
	},
	fetchMerge: function (options, headers) {
		var conf = this.configureFetch();

		if (headers) {
			_.forOwn(headers, function (value, key) {
				conf.headers.set(key, value);
			});
		}

		return _.merge(conf, options);
	},
	peelFetchResponse: function (response) {
		if (response.headers.has('X-MUK-REFRESH-TOKEN')) {
			app.pageContext.me.token = response.headers.get('X-MUK-REFRESH-TOKEN');
		}

		if (response.ok) {
			if (response.status === 204) {
				return Promise.resolve({});
			} else {
				return response.json();
			}
		} else if (response.status === 401) {
			app.pageContext.me.token = '';
			app.router.redirectTo(app.contextPath + 'login');
			throw new Error('Please login again.');
		} else {
			return response.json().then(function (body) {
				var message = '' + response.status + ': ';
				if (body) {
					message += body.message;
				}
				throw new Error('Unexpected status: ' + message);
			});
		}
	},
	handleError: function (error) {
		app.currentPage.setErrorMessage(error.message);
	},
	injectScripts: function () {
		var thisApp = this;

		// GA
		window['GoogleAnalyticsObject'] = 'ga';
		window['ga'] = window['ga'] | function () {
			(window['ga'].q = window['ga'].q | []).push(arguments);
		};
		window['ga'].l = 1 * new Date();

		var gaScript = document.getElementById('gaScript');

		if (!gaScript) {
			scriptLoad(document,
				'https://www.google-analytics.com/analytics.js',
				function (err, scriptElement) {
					if (err) {
						console.err('GA failed to load.');
						console.err(err.message);
					} else {
						scriptElement.id = 'gaScript';
						window.ga('create', thisApp.gaua, 'auto');
						thisApp.trigger('googleAnalytics');
					}
				}
			);
		}

		// font-awesome
		var fontAwesome = document.getElementById('fontAwesome');

		if (!fontAwesome) {
			scriptLoad(document,
				'https://use.fontawesome.com/releases/v5.0.2/js/all.js',
				function (err, scriptElement) {
					if (err) {
						console.err('Font Awesome failed to load.');
						console.err(err.message);
					} else {
						scriptElement.id = 'fontAwesome';
						thisApp.trigger('fontAwesome');
					}
				}
			);
		}

		// bootstrap components
		var bsn = document.getElementById('bsn');

		if (!bsn) {
			scriptLoad(document,
				'https://cdnjs.cloudflare.com/ajax/libs/bootstrap.native/2.0.21/bootstrap-native-v4.min.js',
				function (err, scriptElement) {
					if (err) {
						console.err('Bootstrap native failed to load.');
						console.err(err.message);
					} else {
						scriptElement.id = 'bsn';
						thisApp.trigger('bootstrapNative');
					}
				}
			);
		}

		// placeholder images
		var hjs = document.getElementById('hjs');

		if (!hjs) {
			scriptLoad(document,
				'https://cdnjs.cloudflare.com/ajax/libs/holder/2.9.4/holder.min.js',
				function (err, scriptElement) {
					if (err) {
						console.err('Holder js failed to load.');
						console.err(err.message);
					} else {
						scriptElement.id = 'hjs';
						window.Holder.addTheme('custom', { 'bg': '#afafaf', 'fg': '#cccccc', 'size': 14, 'font': 'FontAwesome', 'font-weight': 'normal'});
						thisApp.trigger('holderJs');
						setTimeout(lazysizes.init, 1000);
					}
				}
			);
		}

		// paypal
		var paypal = document.getElementById('paypal');

		if (!paypal) {
			scriptLoad(document,
				'https://www.paypalobjects.com/api/checkout.js',
				function (err, scriptElement) {
					if (err) {
						console.err('Paypal failed to load.');
						console.err(err.message);
					} else {
						scriptElement.id = 'paypal';
						thisApp.trigger('paypal');
					}
				}
			);
		}

		//stripe
		var stripe = document.getElementById('stripe');

		if (!stripe) {
			scriptLoad(document,
				'https://js.stripe.com/v3/',
				function (err, scriptElement) {
					if (err) {
						console.err('Stripe failed to load.');
						console.err(err.message);
					} else {
						scriptElement.id = 'stripe';
						thisApp.trigger('stripe');
					}
				}
			);
		}
	},
	dateFormat(date) {
		// returns a yyy/mm/dd string
		var candidate = new Date(date);
		var month = '' + (candidate.getMonth() + 1);
		var day = '' + candidate.getDate();
		var year = candidate.getFullYear();

		if (month.length < 2) {
			month = '0' + month;
		}

		if (day.length < 2) {
			day = '0' + day;
		}

		return [year, month, day].join('/');
	},
	dateDiff(datepart, date1, date2) {
		var diff = date2.getTime() - date1.getTime();
		var divideBy = {
			w:604800000,
			d:86400000,
			h:3600000,
			m:60000,
			s:1000 };

		return Math.floor(diff/divideBy[datepart]);
	}
});


// run it on domReady
domReady(_.bind(app.init, app));
