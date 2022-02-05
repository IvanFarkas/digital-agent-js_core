import {Utils} from '@core/Utils';

/**
 * Class that can execute functions when local messages are received. Local messages are prefixed with the instance's id.
 *
 * @alias core/Messenger
 *
 * @property {string} _id - Id for the object. If none is provided a new id will be created. Id should be able to be represented as a string.
 * @property {(Window & typeof globalThis)} _dispatcher - Dispatcher.
 * @property {any} _callbacks - Callbacks.
 * @property {any} _eventListeners - Event Listeners.
 * @property {Messenger} GlobalMessenger - A messenger that can be used for global messaging. When using static listen and emit methods they are executed on this messenger.
 *
 * @property {Object} EVENTS - Built-in events that the Messenger emits.
 */
export declare class Messenger {
  private _id: string;
  private _dispatcher: any;
  private _callbacks: object;
  private _eventListeners: object;

  // public static GlobalMessenger = new Messenger();
  // public static EVENTS: any = {};

  /**
   * @constructor
   *
   * @param {any=} id - Id for the object. If none is provided a new id will be created. Id should be able to be represented as a string.
   */
  constructor(id?: any);

  /**
   * Get the string id of the object.
   *
   * @readonly
   * @type {string}
   */
  get id(): string;

  /**
   * Set the string id of the object.
   *
   * @type {string}
   */
  set dispatcher(dispatcher: any);

  /**
   * Prefix a message with the instance id.
   *
   * @private
   *
   * @param {string} message
   *
   * @returns {string}
   */
  _createLocalMessage(message: string): string;

  /**
   * Return a function that will call a callback function and supply the event's detail property as an argument.
   *
   * @private
   *
   * @param {Function} callback
   *
   * @returns {Function}
   */
  _createListener(callback: any): any;

  /**
   * Create an event object and send it to listeners.
   *
   * @private
   *
   * @param {string} message - Event type name.
   * @param {any=} value - Value to send to listeners.
   *
   * @returns {CustomEvent}
   */
  _createEvent(message: string, value: any): CustomEvent<any>;

  /**
   * Register an event.
   *
   * @private
   *
   * @param {string} message - Event type name.
   * @param {Function} listener - A listener function generated using _createListener.
   */
  _addListener(message: string, listener: any);

  /**
   * Unregister an event.
   *
   * @private
   *
   * @param {string} message - Event type name.
   * @param {Function} listener - A listener function generated using _createListener.
   */
  _removeListener(message: string, listener: any);

  /**
   * Execute a function when a message is received for this object.
   *
   * @param {string} message - The message to listen for.
   * @param {Function} callback - Function to execute once the message is received.
   */
  listenTo(message: string, callback: any);

  /**
   * Prevent a function from being executed when a message is received for this object.
   *
   * @param {string} message - The message to stop listening for.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for the message.
   */
  stopListening(message: string, callback?: any);

  /**
   * De-register callback(s) from being executed when messages matching the given regular expression are received.
   *
   * @param {RegExp} regexp - regexp - The regular expression to filter messages with.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for messages matching the regular expression.
   */
  stopListeningByRegexp(regexp: RegExp, callback: any);

  /**
   * Prevent any functions from being executed when any message is received for this object.
   */
  stopListeningToAll();

  /**
   * Send a message, causing listener functions for the message on this object to be executed.
   *
   * @param {string} message - The message to emit.
   * @param {any=} value - Optional argument to pass to listener callbacks.
   */
  emit(message: string, value: any = {});

  /**
   * Execute a function when a message is received for the global Messenger instance.
   *
   * @static
   *
   * @param {string} message - The message to listen for.
   * @param {Function} callback - Function to execute once the message is received.
   */
  static listenTo(message: string, callback: any, messenger?: any);

  /**
   * Prevent a function from being executed when a message is received for the global Messenger instance.
   *
   * @static
   *
   * @param {string} message - The message to stop listening for.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for the message.
   */
  static stopListening(message: string, callback: any);

  /**
   * De-register callback(s) from being executed on the global messengerr instance when messages matching the given regular expression are received.
   *
   * @param {RegExp} regexp - regexp - The regular expression to filter messages with.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for messages matching the regular expression.
   */
  static stopListeningByRegexp(regexp: RegExp, callback?: any);

  /**
   * Prevent any functions from being executed when any message is received for the global Messenger instance.
   *
   * @static
   */
  static stopListeningToAll();

  /**
   * Send a message, causing listener functions for the message on the global Messenger instance to be executed.
   *
   * @static
   *
   * @param {string} message - The message to emit.
   * @param {any=} value - Optional argument to pass to listener callbacks.
   */
  static emit(message: string, value: any);
}
