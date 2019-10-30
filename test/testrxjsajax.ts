import { Test } from './test';

// set the impl of XMLHttpRequest at global scope
import { XMLHttpRequest, XMLHttpRequestProgressEvent } from '../xmlhttprequest';
(global as any).XMLHttpRequest = XMLHttpRequest;

import { Subscriber } from 'rxjs/Subscriber';
import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxRequest, AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';

import { Transform } from 'stream';

import { interval } from 'rxjs/observable/interval';
import 'rxjs/add/operator/take';

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
    tests.testStream();
    // wait before running the Rx lifecyle report
    interval(2000).take(1).subscribe(
      () => {
        Test.groups.rxreport();
      }
    );
  }

  /**
   * GET
   */
  public testGetHTTPS(): void {
    Test.rxcreate('AJAX::testGetHTTPS');
    const options: AjaxRequest = {
      method: 'GET',
      url: 'https://httpbin.org',
      headers: {},
      responseType: 'text',
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response) => {
        Test.rxnext('AJAX::testGetHTTPS');
        Test.isTrue('AJAX::testGetHTTPS status', response.status === 200);
        Test.isTrue('AJAX::testGetHTTPS read', response.response.length > 10);
      },
      (error) => {
        Test.rxerror('AJAX::testGetHTTPS', error);
      },
      () => {
        Test.rxcomplete('AJAX::testGetHTTPS');
      }
    );
  }

  /**
   * POST
   */
  public testPostHTTPS(): void {
    Test.rxcreate('AJAX::testPostHTTPS');
    const options: AjaxRequest = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: {},
      responseType: 'text',
      body: '{foo: 1}',
    };
    const xhr$ = ajax(options);
    xhr$.subscribe(
      (response: AjaxResponse) => {
        Test.rxnext('AJAX::testPostHTTPS');
        Test.isTrue('AJAX::testPostHTTPS status', response.status === 200);
        Test.isTrue('AJAX::testPostHTTPS read', response.response.length > 10);
      },
      (error) => {
        Test.rxerror('AJAX::testPostHTTPS', error);
      },
      () => {
        Test.rxcomplete('AJAX::testPostHTTPS');
      }
    );
  }

  /**
   * POST
   */
  public testBlob(): void {
    Test.rxcreate('AJAX::testBlob');
    const progress = new Subscriber(
      (e: XMLHttpRequestProgressEvent) => {
        Test.rxprogress('AJAX::testBlob');
        Test.isTrue('AJAX::testBlob', e.xhr.status === 200 && e.loaded > 0, 'PROGRESS');
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
        Test.rxnext('AJAX::testBlob');
        Test.isTrue('AJAX::testBlob status', response.status === 200);
        const buffer = response.response;
        Test.isMd5('AJAX::testBlob read', buffer, 'ec5997c748d28d59941ccb3c51462e29');
      },
      (error) => {
        Test.rxerror('AJAX::testBlob', error);
      },
      () => {
        Test.rxcomplete('AJAX::testBlob');
      }
    );
  }

  /**
   * Stream BLOB
   */
  public testStreamBlob(): void {
    Test.rxcreate('AJAX::testStreamBlob');
    const progress = new Subscriber(
      (e: XMLHttpRequestProgressEvent) => {
        Test.rxprogress('AJAX::testStreamBlob');
        Test.isTrue('AJAX::testStreamBlob', e.xhr.status === 200 && e.loaded > 0, 'PROGRESS');
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
        Test.rxnext('AJAX::testStreamBlob');
        Test.isTrue('AJAX::testStreamBlob status', response.status === 200);
        (<Transform>response.response).on('data', (data: Buffer) => {
          Test.isTrue('AJAX::testStreamBlob read', data.byteLength > 0);
        });
      },
      (error) => {
        Test.rxerror('AJAX::testStreamBlob', error);
      },
      () => {
        Test.rxcomplete('AJAX::testStreamBlob');
      }
    );
  }

  /**
   * Stream
   */
  public testStream(): void {
    Test.rxcreate('AJAX::testStream');
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
        Test.rxnext('AJAX::testStream');
        Test.isTrue('AJAX::testStream status', response.status === 200);
        (<Transform>response.response).on('data', (data: Buffer) => {
          Test.isTrue('AJAX::testStream read', data.byteLength > 10);
        });
      },
      (error) => {
        Test.rxerror('AJAX::testStream', error);
      },
      () => {
        Test.rxcomplete('AJAX::testStream');
      }
    );
  }
}

RxjsAjaxTests.run();
