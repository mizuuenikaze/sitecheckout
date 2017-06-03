#
# Custom makefile for a ampersand based frontend
#

# Make does not offer a recursive wildcard function, so here's one:
rwildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))


client/templates.js: $(call rwildcard,templates/,*.pug)
	puglatizer -d ./templates -o $@

stylesheets/app.css: stylesheets/app.styl
	cd stylesheets; \
	stylus < $(notdir $^) > $(notdir $@)

artifacts/portal.js: client/templates.js $(call rwildcard,client/,*.js)
	browserify -t uglifyify client/app.js | uglifyjs --screw-ie8 -mc > $@

artifacts/theme.css: stylesheets/app.css
	cleancss --output $@ $^

pm2:
	jq -r '.apps[0].env.NODE_ENV |= "$(NODE_ENV)"' process.json > p2.tmp && mv p2.tmp process.json

if DEBUG
NODE_ENV = development
all-local: client/templates.js pm2
else
NODE_ENV = production
checkoutdir = $(prefix)/checkout
checkout_DATA = artifacts/portal.js artifacts/theme.css
all-local: artifacts/portal.js artifacts/theme.css
endif

.PHONY: pm2
