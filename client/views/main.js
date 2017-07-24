// This app view is responsible for rendering all content that goes into
// <html>. It's initted right away and renders itself on DOM ready.
var app = require('ampersand-app');
var setFavicon = require('favicon-setter');
var View = require('ampersand-view');
var dom = require('ampersand-dom');
var ViewSwitcher = require('ampersand-view-switcher');
var _ = require('lodash');
var domify = require('domify');
var localLinks = require('local-links');
var templates = require('../templates');


module.exports = View.extend({
    template: templates.body,
    autoRender: true,
    initialize: function () {
		this.firstServe = true;

		// this marks the correct nav item selected
		this.listenTo(app, 'page', this.handleNewPage);
		this.listenToOnce(app, 'googleAnalytics', this.handleGoogleAnalytics);
		this.listenToOnce(app, 'holderJs', this.handleHolderJs);
		this.listenToOnce(app, 'bootstrapNative', this.handleBootstrapNative);
		this.listenToOnce(app, 'paypal', this.handlePaypal);
		this.listenToOnce(app, 'stripe', this.handleStripe);
    },
    events: {
        'click a[href]': 'handleLinkClick'
    },
    render: function () {
        // some additional stuff we want to add to the document head
        var theFirstChild = document.head.firstChild;
        document.head.insertBefore(domify(templates.head({isDebug: app.debugMode})), theFirstChild);

        // main renderer
        this.renderWithTemplate(this);

        // init and configure our page switcher
        this.pageSwitcher = new ViewSwitcher(this.queryByHook('page-container'), {
            show: function (newView, oldView) {
                // it's inserted and rendered for me
                document.title = _.result(newView, 'pageTitle') || 'checkout';
                document.scrollTop = 0;

                // add a class specifying it's active
                dom.addClass(newView.el, 'active');

                // store an additional reference, just because
                app.currentPage = newView;

				// page is as fully rendered as possible
				// if first load then get external scripts
				if (app.mainView.firstServe) {
					app.mainView.firstServe = false;
					app.injectScripts();
				} else {
					if (window.ga) {
						app.mainView.handleGoogleAnalytics();
					}

					// some modules don't see new elements
					if (window.Holder) {
						app.mainView.handleHolderJs();
					}

					if (window.Affix) {
						app.mainView.handleBootstrapNative(app.mainView.el);
					}

					if (window.paypal) {
						app.mainView.handlePaypal();
					}

					if (window.Stripe) {
						app.mainView.handleStripe();
					}
				}

				if (newView.postRender) {
					newView.postRender();
				}
            }
        });

        // setting a favicon for fun (note, it's dynamic)
        setFavicon('/favicon_m.ico');
        return this;
    },

    handleNewPage: function (view) {
		view.cmsFetch({
			mainView: this,
			pageView: view,
			success: function (model, response, options) {
				// tell the view switcher to render the new one
				options.mainView.pageSwitcher.set(options.pageView);

				// mark the correct nav item selected
				options.mainView.updateActiveNav();
			},
			error: function (model, response, options) {
				if (response.statusCode === 401) {
					app.pageContext.me.token = '';
					app.router.redirectTo(app.contextPath + 'login');
				} else {
					options.pageView.errorMessage = response.rawRequsest.responseText;
				}
			}
		});
    },
	handleGoogleAnalytics: function () {
		window.ga('set', 'page', app.router.history.root + app.router.history.getFragment());
		window.ga('send', 'pageview');
	},
	handleHolderJs: function () {
		window.Holder.run();
	},
	handleBootstrapNative: function (el) {
		if (el) {
			this.updateBootstrapUi(el);
			app.currentPage.bindUiTo('bootstrap');
		}
	},
	handlePaypal: function () {
		app.currentPage.bindUiTo('paypal');
	},
	handleStripe: function () {
		app.currentPage.bindUiTo('stripe');
	},

    // Handles all `<a>` clicks in the app not handled
    // by another view. This lets us determine if this is
    // a click that should be handled internally by the app.
    handleLinkClick: function (e) {
        // This module determines whether a click event is 
        // a local click (making sure the for modifier keys, etc)
        // and dealing with browser quirks to determine if this
        // event was from clicking an internal link. That we should
        // treat like local navigation.
        var localPath = localLinks.pathname(e);
        
        if (localPath) {
            e.preventDefault();
            app.navigate(localPath);
        }
    },

    updateActiveNav: function () {
        var path = window.location.pathname.slice(app.contextPath.length);

        this.queryAll('.nav a[href]').forEach(function (aTag) {
            var aPath = aTag.pathname.slice(app.contextPath.length);

            if ((!aPath && !path) || (aPath && path.indexOf(aPath) === 0)) {
                dom.addClass(aTag.parentNode, 'active');
            } else {
                dom.removeClass(aTag.parentNode, 'active');
            }
        });
    },
	updateBootstrapUi: function (root) {
		var lookUp = root.getElementsByTagName('*');

		if (!this.dataAttributes) {
			this.dataAttributes = {
				Affix: {cons: window.Affix, tag: 'data-spy'},
				ScrollSpy: {cons: window.ScrollSpy, tag: 'data-spy'},
				Carousel: {cons: window.Carousel, tag: 'data-ride'},
				Alert: {cons: window.Alert, tag: 'data-dismiss'},
				Button: {cons: window.Button, tag: 'data-toggle'},
				Collapse: {cons: window.Collapse, tag: 'data-toggle'},
				Dropdown: {cons: window.Dropdown, tag: 'data-toggle'},
				Modal: {cons: window.Modal, tag: 'data-toggle'},
				Popover: {cons: window.Popover, tag: 'data-toggle'},
				Tab: {cons: window.Tab, tag: 'data-toggle'},
				Tooltip: {cons: window.Tooltip, tag: 'data-toggle'}
			};
		}

		_.forOwn(this.dataAttributes,
			function(value, key) {
				for (var i=0; i < lookUp.length; i++) {
					var attrValue = lookUp[i].getAttribute(value.tag);
					var expectedAttrValue = key.replace(/spy/i,'').toLowerCase();
					if ( attrValue && key === 'Button' && ( attrValue.indexOf(expectedAttrValue) > -1 ) // data-toggle="buttons"
						|| attrValue === expectedAttrValue ) { // all other components
						new value.cons(lookUp[i]);
					}
				}
			}
		);
	}
});
