import { XMLHttpRequest, XMLHttpRequestResponse } from '../xmlhttprequest';
export { XMLHttpRequest };
import { Observable } from 'rxjs/Observable';

export interface XMLHttpRequestOptions {
  url: string;
  method: string;
  headers: { [Key: string]: string };
  responseType: any;
}

export class XMLHttpRequestObservable extends Observable<XMLHttpRequest> {
  public constructor(options: XMLHttpRequestOptions) {
    super(
      (observer) => {
        const fetch = new XMLHttpRequest();
        fetch.open(options.method, options.url);
        Object.keys(options.headers).forEach(
          (key) => {
            fetch.setRequestHeader(key, options.headers[key]);
          }
        );
        fetch.responseType = options.responseType;
        fetch.onreadystatechange = () => {
          if (fetch.readyState === 4) {
            if (fetch.status !== 200) {
              return;
            }
            observer.next(fetch);
            observer.complete();
          }
        };
        fetch.send();
      }
    );
  }
}
