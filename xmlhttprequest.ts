//
// Node imports
//
import * as nodehttp from 'http';
import * as nodehttps from 'https';
import * as nodeurl from 'url';

/**
 * Enum for NodeJS http/https events
 */
enum nodeevent {
  data = 'data',
  timeout = 'timeout',
  error = 'error',
  end = 'end',
}

//
// API definition
//

/**
 * Enum for XMLHttpRequest readyState
 */
enum XMLHttpRequestReadyState {
  UNSENT,
  OPENED,
  HEADERS_RECEIVED,
  LOADING,
  DONE,
}

/**
 * Enum for XMLHttpRequest events
 */
enum XMLHttpRequestEvent {
  abort = 'abort',
  error = 'error',
  load = 'load',
  loadstart = 'loadstart',
  progress = 'progress',
  timeout = 'timeout',
  loadend = 'loadend',
}

/**
 * Enum for XMLHttpRequest headers
 */
enum XMLHttpRequestHeader {
  accept = 'accept',
  contentLength = 'content-length',
  mimeType = 'mime-type',
}

/**
 * Enum for XMLHttpRequest protocols
 */
enum XMLHttpRequestProtocol {
  http = 'http:',
  https = 'https:',
}

/**
 * Stubs for unused objects that are in the spec
 */
export declare const XMLHttpRequestUpload: any;
export declare const XMLHttpRequestEventTarget: any;

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
  status: number;
  statusText: string;

  onreadystatechange?: Function;
  readyState: XMLHttpRequestReadyState;

  // XMLHttpRequestEventTarget
  onabort?: Function;
  onerror?: Function;
  onload?: Function;
  onloadstart?: Function;
  onprogress?: Function;
  ontimeout?: Function;
  onloadend?: Function;

  // response
  response: Buffer;
  responseText: string;
  responseXML?: any;
  responseType: string;

  timeout: number;

  upload?: XMLHttpRequestUpload;
  withCredentials: boolean;

  // methods
  open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
  addEventListener(event: string, listener: Function): void;
  setRequestHeader(header: string, value: any): void;
  getResponseHeader(header: string): string | string[];
  getAllResponseHeaders(): string;
  overrideMimeType(mimeType: string);
  send(body?: any): void;
  abort(): void;
}

//
// API implementation
//

export class XMLHttpRequest implements XMLHttpRequestW3CLevel1 {
  static UNSENT = XMLHttpRequestReadyState.UNSENT;
  static OPENED = XMLHttpRequestReadyState.OPENED;
  static HEADERS_RECEIVED = XMLHttpRequestReadyState.HEADERS_RECEIVED;
  static LOADING = XMLHttpRequestReadyState.LOADING;
  static DONE = XMLHttpRequestReadyState.DONE;

  // node references
  private nodeRequest?: nodehttp.ClientRequest;
  private nodeOptions?: nodehttp.RequestOptions;
  private nodeResponse?: nodehttp.IncomingMessage;

  // event listeners
  private listeners: { [event: string]: Function } = {};

  // W3C Level 1 spec
  status = 0;
  statusText = '';

  onreadystatechange?: Function;
  readyState = XMLHttpRequestReadyState.UNSENT;

  response = Buffer.allocUnsafe(0);
  responseText = '';
  responseXML?: any;
  responseType = '';

  private responseMimeType?: string;

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
    this.setRequestHeader(XMLHttpRequestHeader.accept, '*/*');
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
   * Private method to dispatch events
   * W3C Level 1 spec
   * @param eventName as a string
   * @param event XMLHttpRequestProgressEvent optional
   */
  private dispatchEvent(eventName: string, event?: XMLHttpRequestProgressEvent): void {
    const listener = this.listeners[eventName];
    if (listener) {
      listener();
    }
    const callback = this['on' + eventName];
    if (callback) {
      callback();
    }
  }

  /**
   * Register an event callback
   * W3C Level 1 spec
   * @param event name as a string
   * @param listener Function to call on event
   */
  public addEventListener(event: XMLHttpRequestEvent, listener: Function): void {
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
   * NOTE: NodeJS http/https lowercases for all header names
   * @param header name as a string
   * @returns string if single value, otherwise string[]
   */
  public getResponseHeader(header: string): string | string[] {
    return this.nodeResponse.headers[header.toLowerCase()];
  }

  /**
   * Response headers as a CRLF delimited string
   * W3C Level 1 spec
   * NOTE: NodeJS http/https lowercases for all header names
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
   * Override the response mime type header
   * W3C Level 1 spec
   * @param mimeType string to override response mimeType
   */
  public overrideMimeType(mimeType: string): void {
    if (this.readyState === XMLHttpRequestReadyState.UNSENT) {
      this.responseMimeType = mimeType;
    }
  }

  /**
   * Send the request
   * W3C Level 1 spec
   * @param body optional any value to send with request
   * @returns void
   */
  public send(body?: any): void {
    const client = (this.nodeOptions.protocol === XMLHttpRequestProtocol.http) ? nodehttp.request : nodehttps.request;
    if (this.timeout) {
      this.nodeOptions.timeout = this.timeout;
    }

    this.nodeRequest = client(this.nodeOptions, (response: nodehttp.IncomingMessage) => {
      response.pause();
      this.nodeResponse = response;
      this.status = response.statusCode;
      this.statusText = response.statusMessage;


      if (this.responseMimeType) {
        this.nodeResponse.headers[XMLHttpRequestHeader.mimeType] = this.responseMimeType;
      }

      this.nodeResponse.on(nodeevent.error, (error) => {
        this.dispatchEvent(XMLHttpRequestEvent.error);
      });

      this.nodeResponse.on(nodeevent.data, (chunk: any) => {
        this.response = Buffer.concat([this.response, chunk]);
        this.responseText = this.response.toString();
        this.setReadyState(XMLHttpRequestReadyState.LOADING);
        this.dispatchEvent(XMLHttpRequestEvent.progress, <XMLHttpRequestProgressEvent>{
          loaded: this.response.byteLength,
          total: Number(this.getResponseHeader(XMLHttpRequestHeader.contentLength))
        });
      });

      this.nodeResponse.on(nodeevent.timeout, () => {
        this.setReadyState(XMLHttpRequestReadyState.DONE);
        this.dispatchEvent(XMLHttpRequestEvent.timeout);
      });

      this.nodeResponse.on(nodeevent.end, () => {
        this.setReadyState(XMLHttpRequestReadyState.DONE);
        this.dispatchEvent(XMLHttpRequestEvent.load);
        this.dispatchEvent(XMLHttpRequestEvent.loadend);
      });

      response.resume();
      this.setReadyState(XMLHttpRequestReadyState.HEADERS_RECEIVED);
      this.dispatchEvent(XMLHttpRequestEvent.loadstart);
    });

    if (body) {
      if (typeof body === 'object') {
        this.nodeRequest.write(JSON.stringify(body));
      } else {
        this.nodeRequest.write(String(body));
      }
    }

    this.nodeRequest.end();
    this.dispatchEvent(XMLHttpRequestEvent.loadstart);
  }

  /**
   * Abort the request
   * W3C Level 1 spec
   * @returns void
   */
  public abort(): void {
    this.nodeRequest.end();
    this.dispatchEvent(XMLHttpRequestEvent.abort);
  }
}
