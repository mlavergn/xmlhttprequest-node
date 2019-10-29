//
// Node imports
//
import { request as HTTP, ClientRequest, RequestOptions, IncomingMessage } from 'http';
import { request as HTTPS } from 'https';
import { parse as URLParse } from 'url';
import { Transform } from 'stream';

/**
 * Enum for NodeJS http/https events
 */
enum NodeEvent {
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
 * Stubs for unused but defined objects
 */
export declare const XMLHttpRequestEventTarget: any;

/**
 * Interface for XMLHttpRequestUpload
 */
export interface XMLHttpRequestUpload {
  onabort?: Function;
  onerror?: Function;
  onload?: Function;
  onloadstart?: Function;
  onprogress?: Function;
  ontimeout?: Function;
  onloadend?: Function;
}

/**
 * Interface for progress event
 */
export interface XMLHttpRequestProgressEvent {
  loaded: number;
  total: number;
  xhr?: XMLHttpRequest;
}

/**
 * Enum for XMLHttpRequest protocols
 */
export enum XMLHttpRequestResponseType {
  arraybuffer = 'arraybuffer',
  blob = 'blob',
  document = 'document',
  json = 'json',
  text = 'text',
  stream = 'stream', // non-standard
}

/**
 * Interface for W3C XMLHttpRequest Level 1
 */
export interface XMLHttpRequestW3CLevel1 {
  status: number;
  statusText: string;

  onreadystatechange?: Function;
  readyState: XMLHttpRequestReadyState;

  // response
  response: any;
  responseText: string;
  responseXML?: any;
  responseType: XMLHttpRequestResponseType;

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
  private nodeRequest?: ClientRequest;
  private nodeOptions?: RequestOptions;
  private nodeResponse?: IncomingMessage;

  // event listeners
  private listeners: { [event: string]: Function } = {};

  // W3C Level 1 spec
  status = 0;
  statusText = '';

  onreadystatechange?: Function;
  readyState = XMLHttpRequestReadyState.UNSENT;

  private responseBuffer = Buffer.allocUnsafe(0);
  response: any = '';
  responseText = '';
  responseXML?: any;
  responseType = XMLHttpRequestResponseType.text;

  private responseMimeType?: string;

  private progressEvent: XMLHttpRequestProgressEvent = {
    loaded: 0,
    total: 0,
  };

  timeout = 0;

  upload: XMLHttpRequestUpload = {};
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
    this.nodeOptions = URLParse(url);
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
    this.readyState = state;
    if (this.onreadystatechange) {
      this.onreadystatechange();
    }
  }

  /**
   * Private method to dispatch events
   * W3C Level 1 spec
   * @param eventName as a string
   * @param event XMLHttpRequestProgressEvent optional
   */
  private dispatchEvent(eventName: XMLHttpRequestEvent, event?: XMLHttpRequestProgressEvent): void {
    const listener = this.listeners[eventName];
    if (listener) {
      listener();
    }
    const callback = this.upload['on' + eventName];
    if (callback) {
      if (eventName === XMLHttpRequestEvent.progress) {
        callback(event);
      } else {
        callback();
      }
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
    const client = (this.nodeOptions.protocol === XMLHttpRequestProtocol.http) ? HTTP : HTTPS;
    if (this.timeout) {
      this.nodeOptions.timeout = this.timeout;
    }

    this.nodeRequest = client(this.nodeOptions, (response: IncomingMessage) => {
      response.pause();
      this.nodeResponse = response;
      this.status = response.statusCode;
      this.statusText = response.statusMessage;

      this.progressEvent.total = Number(this.getResponseHeader(XMLHttpRequestHeader.contentLength));
      this.progressEvent.xhr = this;

      if (this.responseMimeType) {
        this.nodeResponse.headers[XMLHttpRequestHeader.mimeType] = this.responseMimeType;
      }

      // stream response
      if (this.responseType === XMLHttpRequestResponseType.stream) {
        this.response = new Transform({
          transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
          }
        });
        this.nodeResponse.pipe(this.response, { end: true });
      }

      this.nodeResponse.on(NodeEvent.error, (error) => {
        this.dispatchEvent(XMLHttpRequestEvent.error);
      });

      this.nodeResponse.on(NodeEvent.data, (chunk: Buffer) => {
        if (this.responseType !== XMLHttpRequestResponseType.stream) {
          this.responseBuffer = Buffer.concat([this.responseBuffer, chunk]);
          this.responseText = this.responseBuffer.toString();
        }
        this.setReadyState(XMLHttpRequestReadyState.LOADING);
        this.progressEvent.loaded += chunk.byteLength;
        this.dispatchEvent(XMLHttpRequestEvent.progress, this.progressEvent);
      });

      this.nodeResponse.on(NodeEvent.timeout, () => {
        this.setReadyState(XMLHttpRequestReadyState.DONE);
        this.dispatchEvent(XMLHttpRequestEvent.timeout);
      });

      this.nodeResponse.on(NodeEvent.end, () => {
        switch (this.responseType) {
          case XMLHttpRequestResponseType.json:
            this.responseText = this.responseBuffer.toString();
            this.response = JSON.parse(this.responseText);
            break;
          case XMLHttpRequestResponseType.arraybuffer:
          case XMLHttpRequestResponseType.blob:
            this.response = this.responseBuffer;
            break;
          case XMLHttpRequestResponseType.document:
          case XMLHttpRequestResponseType.text:
            this.response = this.responseBuffer.toString();
            this.responseText = this.response;
            this.responseXML = this.response;
            break;
        }
        this.setReadyState(XMLHttpRequestReadyState.DONE);
        this.dispatchEvent(XMLHttpRequestEvent.load);
        this.dispatchEvent(XMLHttpRequestEvent.loadend);
      });

      response.resume();
      this.setReadyState(XMLHttpRequestReadyState.HEADERS_RECEIVED);
      this.dispatchEvent(XMLHttpRequestEvent.loadstart);
    });

    if (body) {
      if (body instanceof Transform) {
        body.pipe(this.nodeRequest, { end: true });
        return;
      } else if (body instanceof ArrayBuffer) {
        this.nodeRequest.write(body);
      } else if (typeof body === 'object') {
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
