/* global console */
var path = require('path');
var express = require('express');
var helmet = require('helmet');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Moonboots = require('moonboots-express');
var config = require('getconfig');
var semiStatic = require('semi-static');
var serveStatic = require('serve-static');
var stylizer = require('stylizer');
var templatizer = require('puglatizer');
var app = express();
var contextPath = '/checkout';

// a little helper for fixing paths for various environments
var fixPath = function (pathString) {
    return path.resolve(path.normalize(pathString));
};


// -----------------
// Configure express
// -----------------
app.use(serveStatic(fixPath('../public')));

// we only want to expose tests in dev
if (config.isDev) {
    app.use(serveStatic(fixPath('test/assets')));
    app.use(serveStatic(fixPath('test/spacemonkey')));
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// in order to test this with spacemonkey we need frames
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.xssFilter());
app.use(helmet.nosniff());

app.set('view engine', 'pug');


// -----------------
// Set up our little demo API
// -----------------
/*
var api = require('./fakeApi');
app.get('/api/features', api.list);
app.get('/api/features/:id', api.get);
app.delete('/api/features/:id', api.delete);
app.put('/api/features/:id', api.update);
app.post('/api/features', api.add);
*/

// -----------------
// Enable the functional test site in development
// -----------------
if (config.isDev) {
    app.get('/test*', semiStatic({
        folderPath: fixPath('test'),
        root: '/test'
    }));
}


// -----------------
// Set our client config cookie
// -----------------
app.use(function (req, res, next) {
    res.cookie('config', JSON.stringify(config.client), {path: contextPath});
    next();
});


// ---------------------------------------------------
// Configure Moonboots to serve our client application
// ---------------------------------------------------

var allStylesheets = [
    fixPath('stylesheets/app.css'),
];

var allLibraries = [];

new Moonboots({
    moonboots: {
        jsFileName: 'checkout',
        cssFileName: 'checkout',
        main: fixPath('client/app.js'),
        developmentMode: config.isDev,
        libraries: allLibraries,
        stylesheets: allStylesheets,
        browserify: {
            debug: config.isDev
        },
        beforeBuildJS: function () {
            // This re-builds our template files from jade each time the app's main
            // js file is requested. Which means you can seamlessly change jade and
            // refresh in your browser to get new templates.
            if (config.isDev) {
                // broken with pug and puglatizer - unexpected token
                //templatizer(fixPath('templates'), fixPath('client/templates.js'));
            }
        },
        beforeBuildCSS: function (done) {
            // This re-builds css from stylus each time the app's main
            // css file is requested. Which means you can seamlessly change stylus files
            // and see new styles on refresh.
            if (config.isDev) {
                stylizer({
                    infile: fixPath('stylesheets/app.styl'),
                    outfile: fixPath('stylesheets/app.css'),
                    development: config.isDev
                }, done);
            } else {
                done();
            }
        }
    },
	appPath: contextPath,
    server: app
});


// listen for incoming http requests on the port as specified in our config
app.listen(config.http.port);
console.log('Portal is running at: http://localhost:' + config.http.port + ' Yep. That\'s pretty awesome.');
