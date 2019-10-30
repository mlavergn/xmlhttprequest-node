import { Test } from './test';

import { XMLHttpRequest, XMLHttpRequestResponseType } from '../xmlhttprequest';
import { Transform } from 'stream';

export class XMLHttpRequestTests {
  /**
   * Run the testcases
   */
  public static run(): void {
    const tests = new XMLHttpRequestTests();
    tests.testGetHTTP();
    tests.testPostHTTP();
    tests.testGetHTTPS();
    tests.testPostHTTPS();
    tests.testStream();
  }

  /**
   * GET
   */
  public testGetHTTP(): void {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://httpbin.org');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testGetHTTP status', xhr.status === 200);
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        Test.isTrue('XHR::testGetHTTP read', xhr.responseText.length > 100);
      }
    };
    xhr.send();
  }

  /**
   * GET
   */
  public testPostHTTP(): void {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://httpbin.org/post');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testPostHTTP status', xhr.status === 200);
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        Test.isTrue('XHR::testPostHTTP read', xhr.responseText.length > 10);
      }
    };
    xhr.send('{foo: 1}');
  }

  /**
   * GET
   */
  public testGetHTTPS(): void {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://httpbin.org');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testGetHTTPS status', xhr.status === 200);
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        Test.isTrue('XHR::testGetHTTPS read', xhr.responseText.length > 100);
      }
    };
    xhr.send();
  }

  /**
   * POST
   */
  public testPostHTTPS(): void {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://httpbin.org/post');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testPostHTTPS status', xhr.status === 200);
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        Test.isTrue('XHR::testPostHTTPS read', xhr.responseText.length > 10);
      }
    };
    xhr.send({ foo: 2 });
  }

  /**
   * BLOB
   */
  public testBlob(): void {
    const xhr = new XMLHttpRequest();
    xhr.responseType = XMLHttpRequestResponseType.blob;
    xhr.open('GET', 'http://127.0.0.1:8000/static/banksy.jpg');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testBlob status', xhr.status === 200);
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        Test.isTrue('XHR::testBlob read', xhr.response.byteLength === 125761);
      }
    };
    xhr.send();
  }

  /**
   * Stream
   */
  public testStream(): void {
    const xhr = new XMLHttpRequest();
    xhr.responseType = XMLHttpRequestResponseType.stream;
    xhr.open('POST', 'http://127.0.0.1:8000/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testStream status', xhr.status === 200);
      }
      (<Transform>xhr.response).on('data', (data: Buffer) => {
        Test.isTrue('XHR::testStream read', data.byteLength > 0);
      });
    };

    const reqStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      }
    });

    xhr.send(reqStream);
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
  }

  /**
   * Stream
   */
  public testStreamBlob(): void {
    let bytes = 0;
    const xhr = new XMLHttpRequest();
    xhr.responseType = XMLHttpRequestResponseType.stream;
    xhr.open('GET', 'http://127.0.0.1:8000/static/banksy.jpg');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        Test.isTrue('XHR::testStreamBlob status', xhr.status === 200);
      }
      if (xhr.readyState === XMLHttpRequest.LOADING) {
        (<Transform>xhr.response).on('data', (data: Buffer) => {
          bytes += data.byteLength;
        });
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        Test.isTrue('XHR::testStreamBlob done', bytes === 125761);
      }
    };
    xhr.send();
  }
}

XMLHttpRequestTests.run();
