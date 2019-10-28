import { XMLHttpRequestObservable, XMLHttpRequestOptions, XMLHttpRequest } from '../rxjs/xmlhttprequestobservable';

export class XMLHttpRequestObservableTests {
  /**
   * Run the testcases
   */
  public static run(): void {
    const options: XMLHttpRequestOptions = {
      method: 'GET',
      url: 'https://httpbin.org',
      headers: {},
      responseType: 'text'
    };
    const xhr$ = new XMLHttpRequestObservable(options);
    xhr$.subscribe(
      (response) => {
        console.log(`Test HTTPS GET: ${response.status} : ${response.readyState}`);
      }
    );
  }
}

XMLHttpRequestObservableTests.run();
