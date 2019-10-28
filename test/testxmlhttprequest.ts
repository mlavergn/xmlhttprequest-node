import { XMLHttpRequest } from '../xmlhttprequest';

export class XMLHttpRequestTests {
  /**
   * Run the testcases
   */
  public static run(): void {
    const tests = new XMLHttpRequestTests();
    // tests.testGetHTTP();
    // tests.testPostHTTP();
    // tests.testGetHTTPS();
    tests.testPostHTTPS();
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
      console.log(`Test HTTPS GET: ${xhr.status} : ${xhr.readyState}`);
      if (xhr.readyState === 4) {
        console.log(xhr.responseText);
      }
    };
    xhr.send({ foo: 2 });
  }
}

XMLHttpRequestTests.run();
