/**
 * The built-in class for asynchronous Promises.
 * @external Promise
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */
export interface IStatus {
  resolved: boolean;
  rejected: boolean;
  canceled: boolean;
  pending: boolean;
}

/**
 * A Promise object that can be resolved, rejected or canceled at any time by the
 * user.
 *
 * @extends Promise
 *
 * @property {IStatus} _status - Status object {resolved, rejected, canceled, pending}
 * @property {Function} _executable - The function to be executed by the constructor, during the process of constructing the promise. The signature of this is expected to be: executable(  resolutionFunc, rejectionFunc, cancellationFunc ).
 * @property {Function=} _resolve - Optional function to execute once the promise is resolved.
 * @property {Function=} _reject -  Optional function to execute once the promise is rejected.
 * @property {Function=} _cancel - Optional function to execute if the user cancels the promise. Canceling results in the promise having a status of 'resolved'.
 */
export declare class Deferred extends Promise<never> {
  // TODO: Fix P2. Make them private and add getters
  public _status: IStatus;
  public _resolve: any;
  public _reject: any;
  public _cancel: any;
  public _executable: any;

  /**
   * @constructor
   *
   * @param {Function} [executable=() => {}] - The function to be executed by the constructor, during the process of constructing the promise. The signature of this is expected to be: executable(  resolutionFunc, rejectionFunc, cancellationFunc ).
   * @param {Function=} onResolve - Optional function to execute once the promise is resolved.
   * @param {Function=} onReject - Optional function to execute once the promise is rejected.
   * @param {Function=} onCancel - Optional function to execute if the user cancels the promise. Canceling results in the promise having a status of 'resolved'.
   */
  constructor(executable: any = () => {}, onResolve?: any, onReject?: any, onCancel?: any);

  /**
   * Get the resolved state of the promise.
   *
   * @readonly
   */
  public get resolved(): boolean;

  /**
   * Get the rejected state of the promise.
   *
   * @readonly
   */
  public get rejected(): boolean;

  /**
   * Get the canceled state of the promise.
   *
   * @readonly
   */
  public get canceled(): boolean;

  /**
   * Get the pending state of the promise.
   *
   * @readonly
   */
  public get pending(): boolean;

  /**
   * Force the promise to resolve.
   *
   * @param {any=} value - Value to pass to the resolver.
   *
   * @returns {any} - The return value of the resolver function.
   */
  public resolve(value?: any): any;

  /**
   * Force the promise to reject.
   *
   * @param {any=} value - Value to pass to the rejecter.
   *
   * @returns {any} - The return value of the rejecter function.
   */
  public reject(value: any = {}): any;

  /**
   * Force the promise to resolve and set the canceled state to true.
   *
   * @param {any=} value - Value to pass to the canceller.
   *
   * @returns {any} - The return value of the canceller function.
   */
  public cancel(value?: any): any;

  /**
   * Run the promise function to try to resolve the promise. Promise must be pending.
   *
   * @param {any[]} args - Optional arguments to pass after resolve and reject.
   */
  public execute(...args: any[]);

  /**
   * Return a canceled deferred promise.
   *
   * @param {any=} value - Value to cancel the promise with.
   *
   * @returns {Deferred}
   */
  public static cancel(value: any): Deferred;

  /**
   * Return a new Deferred promise that will resolve or reject once all promises in the input array have been resolved or one promise is canceled or rejected.
   * Promises in the array that are Deferred promises will be manually resolved, rejected or canceled when calling resolve, reject or cancel on the return promise.
   *
   * @param {Array.<any>} iterable - An iterable such as an array.
   * @param {Function=} onResolve - Optional function to execute once the promise is resolved.
   * @param {Function=} onReject - Optional function to execute once the promise is rejected.
   * @param {Function=} onCancel - Optional function to execute if the user cancels the promise. Canceling results in the promise having a status of 'canceled'.
   *
   * @returns Deferred
   */
  public static all(iterable?: any, onResolve?: any, onReject?: any, onCancel?: any);
}
