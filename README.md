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
a stripped rxjs.dom.ajax clone. The intent for XMLHttpRequestObservable is to
use it as debugging tool.

It can be used standalone, but the project recommendation is to use rxjs.dom.ajax
directly backed by this XMLHttpRequest implementation.

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
