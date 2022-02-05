import {Messenger} from '@core/Messenger';
import {AbstractHostFeature} from '@core/AbstractHostFeature';
import {Deferred} from '@core/Deferred';
import {Utils} from '@core/Utils';

/**
 * Object that manages access to all Host features. Contains a reference to engine-specific visuals if applicable.
 *
 * @extends core/Messenger
 * @alias core/HostObject
 *
 * @property {any} _owner - Engine owner object of the host.
 * @property {any} _features - Features.
 * @property {(Deferred | Promise<void>)[]} _waits - Progress stored waits.
 * @property {number} _lastUpdate - Set Layer Weights
 * @property {any} emit - Emit notification to the listeners
 * @property {Object} EVENTS - Built-in messages that the Messenger emits.
 * @property {string} [EVENTS.update='onUpdate'] - Message that is emitted after each call to [update]{@link core/HostObject#update}.
 * @property {string} [EVENTS.addFeature='onAddFeature'] - Message that is emitted after each call to [addFeature]{@link core/HostObject#addFeature}.
 * @property {string} [EVENTS.removeFeature='onRemoveFeature'] - Message that is emitted after each call to [removeFeature]{@link core/HostObject#removeFeature}.
 */
export declare class HostObject extends Messenger {
  private _owner: any;

  // TODO: Make private, add getters
  public _features: Map<string, any>; // {}. This is a Map for the unit test only.
  public _waits: (Deferred | Promise<void>)[];

  private _now: number;
  public _lastUpdate: number;

  // public static EVENTS = {
  //   // TODO: Validate. What '...Object.getPrototypeOf(HostObject).EVENTS' wants to do, since we already defind the static EVENTS peopwerties? Perhaps merging some base class sattic props?
  //   // ...Object.getPrototypeOf(HostObject).EVENTS,
  //   // ...HostObject.EVENTS,
  //   update: 'onUpdate',
  //   addFeature: 'onAddFeature',
  //   removeFeature: 'onRemoveFeature',
  // };

  /**
   * @constructor
   *
   * @param {Object=} options - Options for the host.
   * @param {Object=} options.owner - Optional engine-specific owner of the host.
   */
  constructor({owner = {}}: {owner?: any} = {});

  /**
   * Get the engine owner object of the host.
   *
   * @readonly
   * @type {Object}
   */
  get owner(): any;

  /**
   * Get the current time in milliseconds.
   *
   * @readonly
   * @type {number}
   */
  get now(): number;

  /**
   * Get the amount of time in milliseconds since update was last called.
   *
   * @readonly
   * @type {number}
   */
  get deltaTime(): number;

  /**
   * Set the last Update.
   *
   * @type {number}
   */
  set lastUpdate(lastUpdate: number);

  /**
   * This function should be called in the engine's render loop. Executes update loops for all features.
   */
  update();

  /**
   * Return a deferred promise that will wait a given number of seconds before resolving. The host will continuously update the wait promise during the update loop until it resolves.
   *
   * @param {number} [seconds=0] - Number of seconds to wait before resolving.
   * @param {Object=} options - Optional options object
   * @param {Function=} options.onFinish - Callback to execute once the wait time is met.
   * @param {Function=} options.onProgress - Callback to execute each time the wait time progresses towards the target number of seconds. The amount of progress as a 0-1 percentage is passed as an argument.
   * @param {Function=} options.onCancel - Callback to execute if the user cancels the wait before completion.
   * @param {Function=} options.onError - Callback to execute if the wait stops because an error is encountered. The error message is passed as a parameter.
   *
   * @returns {Deferred | Promise<void>}
   */
  wait(seconds: number, {onFinish, onProgress, onCancel, onError}: any = {}): any; // Deferred | Promise<never>;

  /**
   * Instantiate a new Host feature and store it. Features must inherit from HostFeature.
   *
   * @param {any} FeatureClass - Class that will instantiate the feature. Must extend {@link HostFeature}.
   * @param {boolean} [force=false] - Whether or not to overwrite an existing feature if one of this type already exists on the object.
   * @param {any[]} args - Additional arguments to pass to the FeatureClass constructor. The HostObject will always be passed as the first argument.
   *
   * @returns {boolean} - Whether or not a feature was successfully added.
   */
  addFeature(FeatureClass: any, force: boolean = false, ...args: any): boolean;

  /**
   * Remove a feature from the object.
   *
   * @param {string} typeName - Name of the type of feature to remove.
   *
   * @returns {boolean} - Whether or not a feature was successfully removed.
   */
  removeFeature(typeName: string): boolean;

  /**
   * Indicate whether a specified feature is installed on the host.
   *
   * @param {string} typeName - Name of the type of feature to look for.
   *
   * @returns {boolean}
   */
  hasFeature(typeName: string): boolean;

  /**
   * List the names of the features installed on the host.
   *
   * @returns {string[]}
   */
  listFeatures(): string[];
}
