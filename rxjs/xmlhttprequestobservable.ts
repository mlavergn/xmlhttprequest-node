// dependencies
import { XMLHttpRequestW3CLevel1, XMLHttpRequestStatusCode, XMLHttpRequestReadyState } from '../xmlhttprequesttypes';
import { Observable } from 'rxjs/Observable';

// swizzle the definition of XMLHttpRequest based on the execution env
const XMLHttpRequestImpl = this.window ? this.window.XMLHttpRequest : require('../xmlhttprequest').XMLHttpRequest;

/**
 * Interface for XMLHttpRequestOptions
 * Based on Ajax
 */
export interface XMLHttpRequestObservableOptions {
  url?: string;
  body?: any;
  user?: string;
  async?: boolean;
  method?: string;
  headers?: Object;
  timeout?: number;
  password?: string;
  hasContent?: boolean;
  crossDomain?: boolean;
  withCredentials?: boolean;
  responseType: any;
}

export class XMLHttpRequestObservable extends Observable<XMLHttpRequestW3CLevel1> {
  public constructor(options: XMLHttpRequestObservableOptions) {
    super(
      (observer) => {
        const fetch = new XMLHttpRequestImpl();
        fetch.open(options.method, options.url);
        Object.keys(options.headers).forEach(
          (key) => {
            fetch.setRequestHeader(key, options.headers[key]);
          }
        );
        fetch.responseType = options.responseType;
        fetch.onreadystatechange = () => {
          if (fetch.readyState === XMLHttpRequestReadyState.DONE) {
            if (fetch.status !== XMLHttpRequestStatusCode.OK) {
              return;
            }
            observer.next(<XMLHttpRequestW3CLevel1>fetch);
            observer.complete();
          }
        };
        fetch.send();
      }
    );
  }
}
