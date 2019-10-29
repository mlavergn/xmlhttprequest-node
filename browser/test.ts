import { Observable } from 'rxjs/Observable';
import { map, catchError, timeout, delay } from 'rxjs/operators';

import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxRequest, AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';

export class TestAjaxObservable extends Observable<AjaxResponse> {
  public constructor(method: string, url: string, jwt?: string) {
    super(
      (observer) => {
        console.log('IMPL INIT');
        const options: AjaxRequest = {
          url: url,
          method: method,
          headers: {
            Authorization: `BEARER ${jwt}`
          },
          responseType: 'blob'
        };
        const request = ajax(options).subscribe(
          (response) => {
            console.log('IMPL NEXT');
            observer.next(response);
            observer.complete();
          },
          (error) => {
            console.log('IMPL ERROR');
            observer.error(error.status);
            observer.complete();
          }
        );
        return () => {
          console.log('IMPL COMPLETE');
          request.unsubscribe();
        };
      }
    );
  }
}

const testUrl = 'https://upload.wikimedia.org/wikipedia/en/4/4e/Steamboat-willie.jpg';
const proxyUrl = `/proxy?url=${encodeURIComponent(testUrl)}`;
const obs$ = new TestAjaxObservable('GET', proxyUrl);
obs$.subscribe(
  (result) => {
    console.log('EXT PROXY EMITTED');
    const tag = <any>document.getElementById('test');
    console.log(tag);
    tag.src = URL.createObjectURL(result.response);
  },
  (error) => {
    console.log('EXT ERROR');
    console.log(error);
  },
  () => {
    console.log('EXT COMPLETED');
  }
);

//
// JSON test
//

const ajaxOptions: AjaxRequest = {
  method: 'POST',
  url: '/json',
  body: {
    method: 'GET',
    status: 200,
    details: 'JSON test'
  },
  headers: {
    'Content-Type': 'application/json'
  },
};

ajax(ajaxOptions).subscribe(
  (result) => {
    console.log('JSON EMITTED');
    console.log(result);
  },
  (error) => {
    console.log('JSON ERROR');
    console.log(error);
  },
  () => {
    console.log('JSON COMPLETED');
  }
);

//
// REDIRECT test
//

ajaxOptions.body.status = 301;

ajax(ajaxOptions).subscribe(
  (result) => {
    console.log('REDIRECT EMITTED');
    console.log(result);
  },
  (error) => {
    console.log('REDIRECT ERROR');
    console.log(error);
  },
  () => {
    console.log('REDIRECT COMPLETED');
  }
);

//
// CORS test
//

ajaxOptions.url = 'http://localhost:8000/cors';
ajaxOptions.headers = {};
ajaxOptions.crossDomain = true;

ajax(ajaxOptions).subscribe(
  (result) => {
    console.log('CORS EMITTED');
    console.log(result);
  },
  (error) => {
    console.log('CORS ERROR');
    console.log(error);
  },
  () => {
    console.log('CORS COMPLETED');
  }
);
