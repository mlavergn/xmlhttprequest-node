import * as nodehttp from 'http';
import * as nodehttps from 'https';
import * as nodeurl from 'url';

enum XMLHttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
}

export interface XMLHttpRequestResponse {
  status: number;
  statusText: string;
}

enum XMLHttpRequestReadyState {
  UNSENT,
  OPENED,
  HEADERS_RECEIVED,
  LOADING,
  DONE,
}

enum XMLHttpRequestEvent {
  abort = 'abort',
  error = 'error',
  load = 'load',
  loadend = 'loadend',
  loadstart = 'loadstart',
  progress = 'progress',
}

interface XMLHttpRequestProgressEvent {
  loaded: number;
  total: number;
}

export class XMLHttpRequest {
  private nodeRequest?: nodehttp.ClientRequest;
  private nodeOptions?: nodehttp.RequestOptions;
  private nodeResponse?: nodehttp.IncomingMessage;

  private listeners: { [event: string]: Function } = {};

  status?: number;
  statusText?: string;

  onreadystatechange?: Function;
  readyState = XMLHttpRequestReadyState.UNSENT;

  response?: string;
  responseText?: string;
  responseXML?: string;
  responseType = '';

  ontimeout?: Function;
  timeout = 0;

  upload?: any;
  withCredentials = false;

  /**
   * Open the request
   */
  public open(method: string, url: string, async: boolean = true, user?: string, password?: string) {
    this.nodeOptions = nodeurl.parse(url);
    this.nodeOptions.method = method;
    this.nodeOptions.headers = {};
    this.setRequestHeader('Accept', '*/*');
    this.setReadyState(XMLHttpRequestReadyState.OPENED);
  }

  /**
   * Private method to trigger ready state callback
   */
  private setReadyState(state: XMLHttpRequestReadyState): void {
    if (this.readyState !== state) {
      this.readyState = state;
      if (this.onreadystatechange) {
        this.onreadystatechange();
      }
    }
  }

  /**
   * Private method to trigger events
   */
  private sendEvent(eventName: string, event?: XMLHttpRequestProgressEvent): void {
    const listener = this.listeners[eventName];
    if (listener) {
      listener();
    }
  }

  public addEventListener(event: string, listener: Function): void {
    this.listeners[event] = listener;
  }

  /**
   * Set a request header
   */
  public setRequestHeader(header: string, value: any) {
    this.nodeOptions.headers[header] = value;
  }

  /**
   * Get a response header
   */
  public getResponseHeader(header: string): string | string[] {
    return this.nodeResponse.headers[header];
  }

  /**
   * Response headers as a CRLF delimited string
   */
  public getAllResponseHeaders(): string {
    const kv: string[] = [];
    Object.keys(this.nodeResponse.headers).forEach(
      (header: string) => {
        kv.push(header + ': ' + this.nodeResponse.headers[header]);
      }
    );
    return kv.join('\r\n');
  }

  /**
   * Send the request
   */
  public send(body?: any): void {
    const client = (this.nodeOptions.protocol === 'http:') ? nodehttp.request : nodehttps.request;
    this.nodeRequest = client(this.nodeOptions, (response: nodehttp.IncomingMessage) => {
      this.nodeResponse = response;
      this.status = response.statusCode;
      this.statusText = response.statusMessage;
      this.setReadyState(XMLHttpRequestReadyState.HEADERS_RECEIVED);

      this.nodeResponse.on('error', (error) => {
        this.sendEvent(XMLHttpRequestEvent.error);
      });

      this.nodeResponse.on('data', (chunk: any) => {
        this.response = this.response ? this.response + chunk : chunk;
        this.responseText = String(this.response);
        this.setReadyState(XMLHttpRequestReadyState.LOADING);
        this.sendEvent(XMLHttpRequestEvent.progress, <XMLHttpRequestProgressEvent>{
          loaded: this.response.length,
          total: Number(this.getResponseHeader('Content-Length'))
        });
      });

      this.nodeResponse.on('end', () => {
        this.setReadyState(XMLHttpRequestReadyState.DONE);
        this.sendEvent(XMLHttpRequestEvent.load);
        this.sendEvent(XMLHttpRequestEvent.loadend);
      });
    });

    if (body) {
      if (typeof body === 'object') {
        this.nodeRequest.write(JSON.stringify(body));
      } else {
        this.nodeRequest.write(String(body));
      }
    }

    this.nodeRequest.end();
    this.sendEvent(XMLHttpRequestEvent.loadstart);
  }

  /**
   * Abort the request
   */
  public abort(): void {
    this.nodeRequest.end();
    this.sendEvent(XMLHttpRequestEvent.abort);
  }
}
