// set the impl of XMLHttpRequest at global scope
import { XMLHttpRequest, XMLHttpRequestProgressEvent } from '../xmlhttprequest';
(global as any).XMLHttpRequest = XMLHttpRequest;

import { Subscriber } from 'rxjs/Subscriber';
import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxRequest, AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';

import { Transform } from 'stream';

import * as nodecrypto from 'crypto';

export class RxjsAjaxTests {
  /**
   * Run the testcases
   */
  public static run(): void {
    const tests = new RxjsAjaxTests();
    tests.testGetHTTPS();
    tests.testPostHTTPS();
    tests.testBlob();
    tests.testStreamBlob();
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
    const progress = new Subscriber(
      (e: XMLHttpRequestProgressEvent) => {
        console.log('PROGRESS testStreamBlob', e.loaded, e.xhr.status);
      }
    );
    const options: AjaxRequest = {
      method: 'GET',
      url: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Steamboat-willie.jpg',
      headers: {},
      responseType: 'blob',
      progressSubscriber: progress,
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response) => {
        const buffer = response.response;
        console.log(`Test Blob GET: ${response.status} ${buffer.byteLength}`);
        if (response.status !== 200) {
          console.error('FAIL', 'status');
        }
        const hash = nodecrypto.createHash('md5').update(buffer).digest('hex');
        if (hash !== 'ec5997c748d28d59941ccb3c51462e29') {
          console.error('FAIL', 'md5sum');
        } else {
          console.log('PASS');
        }
      }
    );
  }

  /**
   * Stream BLOB
   */
  public testStreamBlob(): void {
    const progress = new Subscriber(
      (e: XMLHttpRequestProgressEvent) => {
        console.log('PROGRESS testStreamBlob', e.loaded, e.xhr.status);
      }
    );
    const options: AjaxRequest = {
      method: 'GET',
      url: 'http://127.0.0.1:8000/static/banksy.jpg',
      responseType: 'stream',
      headers: {
      },
      progressSubscriber: progress,
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response: any) => {
        console.log(`NEXT Blob GET: ${response.status}`);
        if (response.status !== 200) {
          console.error('FAIL', 'status');
        }
        (<Transform>response.response).on('data', (data: Buffer) => {
          console.log(data.byteLength);
        });
      },
      (error) => {
        console.log('ERROR testStreamBlob', error);
      },
      () => {
        console.log('COMPLETE testStreamBlob');
      }
    );
  }

  /**
   * Stream
   */
  public testStream(): void {
    const reqStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      }
    });

    const options: AjaxRequest = {
      method: 'POST',
      url: 'http://127.0.0.1:8000/json',
      headers: {
        'Content-Type': 'binary/octet-stream'
      },
      responseType: 'stream',
      body: reqStream
    };
    const xhr$ = ajax(options);
    reqStream.write(
      JSON.stringify(
        {
          method: 'GET',
          status: 200,
          details: 'The quick brown fox jumped over the lazy dog.'
        }
      )
    );
    reqStream.end();

    xhr$.subscribe(
      (response: any) => {
        console.log(`Test Blob GET: ${response.status}`);
        if (response.status !== 200) {
          console.error('FAIL', 'status');
        }

        (<Transform>response.response).on('data', (data: Buffer) => {
          console.log(data.toString());
        });
      }
    );
  }
}

RxjsAjaxTests.run();
