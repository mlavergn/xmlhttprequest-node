# XMLHttpRequest-Node

Lightweight TypeScript based XMLHttpRequest adapter for NodeJS

This project was created because there was no zero dependency TypeScript based
XMLHttpRequest implementation for NodeJS.

The project goals are:

- No external dependencies beyond the core NodeJS library
- TypeScript based implementation
- Lightweight, easy to grok implementation
- Compatiblity with RxJS ajax usage of XMLHttpRequest

## RxJS

The project contains an implementation of XMLHttpRequestObservable which is
an rxjs.dom.ajax clone. The intent for XMLHttpRequestObservable is to
provide a drop in replacement for rxjs.dom.ajax (aka. AjaxRequest).

The implementation of rxjs.dom.ajax in RxJS 5.5 is currently not compatible with
Node and it is not intended to be extendable.

XMLHttpRequestObservable doubles as a test bench for XMLHttpRequest due to it's
ease of use and ability to generate a large volume of requests easily.

## Usage

XMLHttpRequest-Node uses make and those makefile targets expect a UNIX
environemnt. It developed on a macos, and the build environment expects
macos to be present.

XMLHttpRequest-Node is not NPM published, the current recommendation is to use
it as a local module

```bash
  git submodule add https://github.com/mlavergn/xmlhttprequest-node.git

  > cat package.json
  {
    "devDependencies": {
      "xmlhttprequest-node": "file:xmlhttprequest-node"
    }
  }

  npm install xmlhttprequest-node --save-dev

  > cat somefile.ts
  import { XMLHttpRequest } from 'xmlhttprequest-node/xmlhttprequest';
```
