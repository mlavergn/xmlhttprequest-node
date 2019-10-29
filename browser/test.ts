import { Observable } from 'rxjs/Observable';
import { map, catchError, timeout, delay } from 'rxjs/operators';

import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxRequest, AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';

export class TestAjaxObservable extends Observable<AjaxResponse> {
  public constructor(method: string, url: string, jwt?: string) {
    super(
      (observer) => {
        console.log('INIT');
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
            console.log('NEXT');
            observer.next(response);
            observer.complete();
          },
          (error) => {
            console.log('ERROR');
            observer.error(error.status);
            observer.complete();
          }
        );
        return () => {
          console.log('COMPLETE');
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
    console.log('PROXY EMITTED');
    const tag = <any>document.getElementById('test');
    console.log(tag);
    tag.src = URL.createObjectURL(result.response);
  }
);

const postOptions: AjaxRequest = {
  method: 'POST',
  url: '/json',
  body: JSON.stringify({
    method: 'GET',
    status: 200,
    details: 'JSON test'
  }),
  headers: {
    'Content-Type': 'application/json'
  },
};

const obsPost$ = ajax(postOptions);
obsPost$.subscribe(
  (result) => {
    console.log('POST EMITTED');
    console.log(result);
  }
);
