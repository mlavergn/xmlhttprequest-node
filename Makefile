###############################################
#
# Makefile
#
###############################################

.DEFAULT_GOAL := build

deps:
	npm install typescript rxjs @types/node tslint rxjs-tslint-rules --save-dev

lint:
	./node_modules/tslint/bin/tslint --project tslint.json **.ts test/**.ts

build: clean lint
	# ES5 for IE11 compat
	tsc -t ES5 --lib es2017,dom --alwaysStrict -d -diagnostics --outDir lib **.ts test/**.ts rxjs/**.ts

test: build
	node lib/test/testxmlhttprequest
	node lib/test/testxmlhttprequestobservable
	node lib/test/testrxjsajax

install: build
	npm install --save

clean:
	rm -rf lib/**

distclean: clean
	rm -rf node_modules
	rm -f package-lock.json
