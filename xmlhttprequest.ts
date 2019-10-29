//
// Node imports
//
import * as nodehttp from 'http';
import * as nodehttps from 'https';
import * as nodeurl from 'url';

//
// API definition
//

/**
 * Enum for XMLHttpRequest methods
 */
export enum XMLHttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  OPTION = 'OPTION',
}

/**
 * Enum for XMLHttpRequest status codes
 */
export enum XMLHttpRequestStatusCode {
  OK = 200,
}

/**
 * Enum for XMLHttpRequest readyState
 */
export enum XMLHttpRequestReadyState {
  UNSENT,
  OPENED,
  HEADERS_RECEIVED,
  LOADING,
  DONE,
}

/**
 * Enum for XMLHttpRequest events
 */
export enum XMLHttpRequestEvent {
  abort = 'abort',
  error = 'error',
  load = 'load',
  loadend = 'loadend',
  loadstart = 'loadstart',
  progress = 'progress',
}

/**
 * Interface for progress event
 */
export interface XMLHttpRequestProgressEvent {
  loaded: number;
  total: number;
}

/**
 * Interface for W3C XMLHttpRequest Level 1
 */
export interface XMLHttpRequestW3CLevel1 {
  status?: number;
  statusText?: string;

  onreadystatechange?: Function;
  readyState: XMLHttpRequestReadyState;

  response?: any;
  responseText?: string;
  responseXML?: any;
  responseType: string;

  ontimeout?: Function;
  timeout: number;

  upload?: any;
  withCredentials: boolean;

  open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
  addEventListener(event: string, listener: Function): void;
  setRequestHeader(header: string, value: any): void;
  getResponseHeader(header: string): string | string[];
  getAllResponseHeaders(): string;
  send(body?: any): void;
  abort(): void;
}

//
// API implementation
//

export class XMLHttpRequest implements XMLHttpRequestW3CLevel1 {
  // node references
  private nodeRequest?: nodehttp.ClientRequest;
  private nodeOptions?: nodehttp.RequestOptions;
  private nodeResponse?: nodehttp.IncomingMessage;

  // event listeners
  private listeners: { [event: string]: Function } = {};

  // W3C Level 1 spec
  status?: number;
  statusText?: string;

  onreadystatechange?: Function;
  readyState = XMLHttpRequestReadyState.UNSENT;

  response?: Buffer;
  responseText?: string;
  responseXML?: any;
  responseType = '';

  ontimeout?: Function;
  timeout = 0;

  upload?: any;
  withCredentials = false;

  /**
   * Open the request
   * W3C Level 1 spec
   * @param method string
   * @param url string
   * @param async boolean optional (default: true)
   * @param user string optional
   * @param password string optional
   */
  public open(method: string, url: string, async: boolean = true, user?: string, password?: string): void {
    this.nodeOptions = nodeurl.parse(url);
    this.nodeOptions.method = method;
    this.nodeOptions.headers = {};
    this.setRequestHeader('Accept', '*/*');
    this.setReadyState(XMLHttpRequestReadyState.OPENED);
  }

  /**
   * Private method to trigger ready state callback
   * @param state XMLHttpRequestReadyState
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
   * W3C Level 1 spec
   * @param eventName as a string
   * @param event XMLHttpRequestProgressEvent optional
   */
  private sendEvent(eventName: string, event?: XMLHttpRequestProgressEvent): void {
    const listener = this.listeners[eventName];
    if (listener) {
      listener();
    }
  }

  /**
   * Register an event callback
   * W3C Level 1 spec
   * @param event name as a string
   * @param listener Function to call on event
   */
  public addEventListener(event: string, listener: Function): void {
    this.listeners[event] = listener;
  }

  /**
   * Set a request header
   * W3C Level 1 spec
   * @param header name as a string
   * @param value any
   */
  public setRequestHeader(header: string, value: any): void {
    this.nodeOptions.headers[header] = value;
  }

  /**
   * Get a response header
   * W3C Level 1 spec
   * @param header name as a string
   * @returns string if single value, otherwise string[]
   */
  public getResponseHeader(header: string): string | string[] {
    return this.nodeResponse.headers[header];
  }

  /**
   * Response headers as a CRLF delimited string
   * W3C Level 1 spec
   * @returns string result
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
   * W3C Level 1 spec
   * @param body optional any value to send with request
   * @returns void
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
        this.response = this.response ? Buffer.concat([this.response, chunk]) : Buffer.concat([chunk]);
        this.responseText = this.response.toString();
        this.setReadyState(XMLHttpRequestReadyState.LOADING);
        this.sendEvent(XMLHttpRequestEvent.progress, <XMLHttpRequestProgressEvent>{
          loaded: this.response.byteLength,
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
   * W3C Level 1 spec
   * @returns void
   */
  public abort(): void {
    this.nodeRequest.end();
    this.sendEvent(XMLHttpRequestEvent.abort);
  }
}
