.PHONY: hint prepare-test-browser test test-chrome test-firefox test-node

test: hint test-node

hint: node_modules/.bin/jshint
	node_modules/.bin/jshint --show-non-errors lib test

test-node: node_modules/.bin/nodeunit
	node_modules/.bin/nodeunit test

test-chrome: prepare-test-browser
	google-chrome browser-test/index.html

test-firefox: prepare-test-browser
	firefox browser-test/index.html

prepare-test-browser: browser-test/app.js node_modules/nodeunit/dist/browser/nodeunit.js

node_modules/.bin/gluejs: node_modules
node_modules/.bin/jshint: node_modules
node_modules/.bin/nodeunit: node_modules
node_modules/nodeunit: node_modules
node_modules: package.json
	npm install

browser-test/app.js: node_modules/.bin/gluejs lib/* test/*
	./node_modules/.bin/gluejs --global-require --include ./lib/ --include ./test/ --include ./node_modules/nodeunit/lib/ --main test/tests.js --out ./browser-test/app.js

node_modules/nodeunit/dist/browser/nodeunit.js: node_modules/nodeunit
	cd node_modules/nodeunit && npm install
	cd node_modules/nodeunit && make browser
