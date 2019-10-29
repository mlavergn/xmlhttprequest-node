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
	tsc -t ES5 --lib es2017,dom --alwaysStrict -d -diagnostics **.ts test/**.ts

test: build
	node test/testxmlhttprequest
	node test/testrxjsajax

install: build
	npm install --save

clean:
	rm -rf **.js **.d.ts test/**.js test/**.d.ts

distclean: clean
	rm -rf node_modules
	rm -f package-lock.json
