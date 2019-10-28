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
