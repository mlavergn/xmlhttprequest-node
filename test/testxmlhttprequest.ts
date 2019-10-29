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
      console.log(`Test HTTP GET: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === 4) {
        console.log(xhr.responseText);
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
      console.log(`Test HTTP POST: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === 4) {
        console.log(xhr.responseText);
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
      console.log(`Test HTTPS GET: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === 4) {
        console.log(xhr.responseText);
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
      console.log(`Test HTTPS POST: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === 4) {
        console.log(xhr.responseText);
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
      console.log(`Test BLOB: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === 4) {
        console.log(xhr.response.byteLength);
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
      console.log(`Test STREAM: ${xhr.status} : ${xhr.readyState}`);

      (<Transform>xhr.response).on('data', (data: Buffer) => {
        console.log(data.toString());
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
      console.log(`Test STREAM: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === XMLHttpRequest.LOADING) {
        (<Transform>xhr.response).on('data', (data: Buffer) => {
          bytes += data.byteLength;
          console.log(bytes);
        });
      }
    };
    xhr.send();
  }
}

XMLHttpRequestTests.run();
