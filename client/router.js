var app = require('ampersand-app');
var Router = require('ampersand-router');
var MassagePage = require('./pages/massage');


module.exports = Router.extend({
    routes: {
        'checkout/': 'home',
        '(*path)': 'catchAll'
    },

    // ------- ROUTE HANDLERS ---------
    home: function () {
        app.trigger('page', new MassagePage({
            model: app.me
        }));
    },

    catchAll: function () {
        this.redirectTo(app.contextPath + '');
    }
});
