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

The implementation of rxjs.dom.ajax in RxJS 5.5 is currently not compatible with
NodeJS since it lacks a native XMLHttpRequest Object.

XMLHttpRequest is specifically designed to provide the necessary functionality
to use rxjs/observable/dom/ajax in NodeJS applications.

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

  # to use in NodeJS code without RxJS
  > cat somefile.ts
  import { XMLHttpRequest } from 'xmlhttprequest-node/xmlhttprequest';

  # to use in NodeJS code as XMLHttpRequest for RxJS
  > cat somefile.ts
  import { XMLHttpRequest } from 'xmlhttprequest-node/xmlhttprequest';
  (global as any).XMLHttpRequest = XMLHttpRequest;

  # to use in shared Browser / NodeJS code as XMLHttpRequest for RxJS
  > cat somefile.ts
  if (this.window) {
    (global as any).XMLHttpRequest = require('xmlhttprequest-node/xmlhttprequest').XMLHttpRequest;
  }
```
