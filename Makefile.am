#
# Custom makefile for a ampersand based frontend
#

# Make does not offer a recursive wildcard function, so here's one:
rwildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))


client/templates.js: $(call rwildcard,templates/,*.pug)
	$(PUGLATIZER) -d ./templates -o $@

stylesheets/app.css: stylesheets/app.styl
	cd stylesheets; \
	$(STYLUS) < $(notdir $^) > $(notdir $@)

artifacts/portal.js: client/templates.js $(call rwildcard,client/,*.js)
	$(BROWSERIFY) -t uglifyify client/app.js | $(UGLIFYJS) --screw-ie8 -mc > $@

artifacts/theme.css: stylesheets/app.css
	$(CLEANCSS) --output $@ $^

pm2:
	$(JQ) -r '.apps[0].env.NODE_ENV |= "$(NODE_ENV)"' process.json > p2.tmp && mv p2.tmp process.json

clean-local:
	rm -f client/templates.js artifacts/*

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
