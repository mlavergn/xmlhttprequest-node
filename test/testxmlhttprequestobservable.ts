import { XMLHttpRequestObservable, XMLHttpRequestObservableOptions } from '../rxjs/xmlhttprequestobservable';

export class XMLHttpRequestObservableTests {
  /**
   * Run the testcases
   */
  public static run(): void {
    const options: XMLHttpRequestObservableOptions = {
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
