// set the impl of XMLHttpRequest at global scope
(global as any).XMLHttpRequest = require('../xmlhttprequest').XMLHttpRequest;

import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxRequest, AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';

import * as nodecrypto from 'crypto';

export class RxjsAjaxTests {
  /**
   * Run the testcases
   */
  public static run(): void {
    const tests = new RxjsAjaxTests();
    // tests.testGetHTTPS();
    // tests.testPostHTTPS();
    tests.testBlob();
  }

  /**
   * GET
   */
  public testGetHTTPS(): void {
    const options: AjaxRequest = {
      method: 'GET',
      url: 'https://httpbin.org',
      headers: {},
      responseType: 'text',
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response) => {
        console.log(`Test HTTPS GET: ${response.status}`);
      }
    );
  }

  /**
   * POST
   */
  public testPostHTTPS(): void {
    const options: AjaxRequest = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: {},
      responseType: 'text',
      body: '{foo: 1}',
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response) => {
        console.log(`Test HTTPS GET: ${response.status} ${response.response}`);
      }
    );
  }

  /**
   * POST
   */
  public testBlob(): void {
    const options: AjaxRequest = {
      method: 'GET',
      url: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Steamboat-willie.jpg',
      headers: {},
      responseType: 'blob',
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response) => {
        console.log(`Test Blob GET: ${response.status} ${response.response.byteLength}`);
        if (response.status !== 200) {
          console.error('FAIL', 'status');
        }
        const bytes = Buffer.concat([response.response]);
        const hash = nodecrypto.createHash('md5').update(bytes).digest('hex');
        if (hash !== 'ec5997c748d28d59941ccb3c51462e29') {
          console.error('FAIL', 'md5sum');
        }
      }
    );
  }
}

RxjsAjaxTests.run();
