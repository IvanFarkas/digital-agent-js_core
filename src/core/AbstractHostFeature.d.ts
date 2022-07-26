import { Messenger } from '@core/Messenger';
import { HostObject } from '@core/HostObject';

/**
 * Creates a class that implements {@link HostFeatureMixin} and extends a specified base class.
 *
 * @param {Class} base - The class to extend.
 *
 * @return A class that extends `base` and implements {@link HostFeatureMixin}.
 */

/**
 * Base class for all host features. Keeps a reference to the host object managing the feature.
 *
 * @abstract
 *
 * @property {HostObject} _host - The HostObject managing the feature.
 * @property {Object} EVENTS - Built-in messages that the feature emits. When the feature is added to a {@link core/HostObject}, event names will be prefixed by the name of the feature class + '.'.
 * @property {string} [EVENTS.update=onUpdate] - Message that is emitted after each call to [update]{@link HostFeatureMixin#update}.
 * @property {Object} SERVICES - Any AWS services that are necessary for the feature to function.
 */
export declare class AbstractHostFeature {
  public _host: HostObject;
  public _discarded: boolean;

  // public static EVENTS: any = {update: 'onUpdate'};
  // public static SERVICES = {};

  /**
   * @constructor
   *
   * @param {HostObject} host - The HostObject managing the feature.
   */
  constructor(host: HostObject);

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   *
   * @returns {any} API
   */
  installApi(): any;

  /**
   * Get the host that manages the feature.
   *
   * @readonly
   */
  get host(): any;

  /**
   * Get the engine owner object of the host.
   *
   * @readonly
   */
  get owner(): any;

  /**
   * Listen to a feature message from the host object.
   *
   * @param {string} message - Message to listen for.
   * @param {Function} callback - The callback to execute when the message is received.
   */
  listenTo(message: string, callback: any);

  /**
   * Listen to a feature message from the global messenger. Feature messages will be prefixed with the class name of the feature.
   *
   * @param {string} message - Message to listen for.
   * @param {Function} callback - The callback to execute when the message is received.
   */
  static listenTo(message: string, callback: any);

  /**
   * Stop listening to a message from the host object.
   *
   * @param {string} message - Message to stop listening for.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for the message.
   */
  stopListening(message: string, callback: any) {
    this._host.stopListening(message, callback);
  }

  /**
   * Stop listening to a message from the global messenger.
   *
   * @param {string} message - Message to stop listening for.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for the message.
   */
  static stopListening(message: string, callback: any);

  /**
   * Stop listening to a message matching the given regular expression from the host object.
   *
   * @param {RegExp} regexp - The regular expression to stop listening for.
   * @param {Function=} callback - Optional callback to remove. If none is defined,
   * remove all callbacks for the message.
   */
  stopListeningByRegexp(regexp: RegExp, callback: any);

  /**
   * Stop listening to a message matching the given regular expression from the global messenger.
   *
   * @param {RegExp} regexp - The regular expression to stop listening for.
   * @param {Function=} callback - Optional callback to remove. If none is defined, remove all callbacks for the message.
   */
  static stopListeningByRegexp(regexp: RegExp, callback: any);

  /**
   * Stop listening to all messages.
   */
  stopListeningToAll();

  /**
   * Stop listening to all feature messages.
   */
  static stopListeningToAll();

  /**
   * Emit feature messages from the host. Feature messages will be prefixed with the class name of the feature.
   *
   * @param {string} message - The message to emit.
   * @param {any=} value - Optional parameter to pass to listener callbacks.
   */
  emit(message: string, value: any);

  /**
   * Emit feature messages from the global messenger. Feature messages will be prefixed with the class name of the feature.
   *
   * @param {string} message - The message to emit.
   * @param {any=} value - Optional parameter to pass to listener callbacks.
   */
  static emit(message: string, value?: any);

  /**
   * Executes each time the host is updated.
   *
   * @param {number} deltaTime - Amount of time since the last host update was called.
   */
  update(deltaTime?: number);

  /**
   * Clean up once the feature is no longer in use. Remove the feature namespace from the host and remove reference to the host.
   */
  discard();
}
