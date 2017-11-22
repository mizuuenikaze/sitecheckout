# WindUponTheWater Checkout

This app was generated with the [ampersand cli tool](http://ampersandjs.com/learn/quick-start-guide).

## Modifications
1. Replaced jade with pug 2.x and using puglatizer
1. Upgraded bootstrap
1. pm2 launch and monitoring

This is a simple checkout flow for paypal and stripe.  The backends
are separate projects that provide distinct restful apis.  Final deployments into a webserver to deliver the client apps remove the need for express and fake apis that are in this project for development and testing.

## Production build
Configure for production
\$ ./configure --prefix=/var/www/domain.tld/htdocs --enable-debug=no
\$ make

## How to run it

1. download/install [node.js](http://nodejs.org/)
1. install pm2
1. install dependencies: `npm install`
1. run it: `pm2 start process.json`
1. open http://localhost:3000 in a browser

## How it's structured

See docs: http://ampersandjs.com/
Curated modules: http://tools.ampersandjs.com/

## Credits

Built by folks at [&yet](http://andyet.com).

## Want a deeper understanding?

Get the book: http://humanjavascript.com
