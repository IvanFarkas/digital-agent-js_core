import {Deferred} from '@core/Deferred';

export enum Env {
  Core = 'core',
  Three = 'three',
}

/**
 * A collection of useful generic functions.
 *
 * @hideconstructor
 *
 * @property {string} index - Index.
 */
export class Utils {
  /**
   * @static
   *
   * Generate a unique id
   *
   * @returns {String}
   */
  static createId(): string;

  /**
   * @static
   *
   * Check a name string against an array of strings to determine if it is unique.
   * If it isn't, append incremented trailing integers to the end of the name until it is unique.
   *
   * @param {string} name - String name to make unique.
   * @param {string[]} names - Array of string names to check agains.
   *
   * @returns {string}
   */
  static getUniqueName(name: string, names: string[] = []): string;

  /**
   * Return a deferred promise that will wait a given number of seconds before resolving.
   * Pass delta time in milliseconds to the deferred promise's execute method in an update loop to progress time.
   *
   * @param {number} [seconds=0] - Number of seconds to wait before resolving.
   * @param {Object=} options - Optional options object
   * @param {Function} [options.onFinish] - Callback to execute once the wait time is met.
   * @param {Function=} options.onProgress - Callback to execute each time the wait time progresses towards the target number of seconds. The amount of progress as a 0-1 percentage is passed as an argument.
   * @param {Function=} options.onCancel - Callback to execute if the user cancels the wait before completion.
   * @param {Function=} options.onError - Callback to execute if the wait stops because an error is encountered. The error message is passed as a parameter.
   *
   * @returns { Promise<void>}
   */
  static wait(seconds: number = 0, {onFinish, onProgress, onCancel, onError}: any = {}): any; // Deferred | Promise<void>;

  /**
   * Get a random float number between a min (inclusive) and max (exclusive) value
   *
   * @param {number} min minimum value
   * @param {number} max maximum value
   * @returns {float}
   */
  static getRandomFloat(min: number, max: number): any;

  /**
   * Get a random integer number between a min (inclusive) and max (exclusive) value
   *
   * @param {number} min minimum value
   * @param {number} max maximum value
   * @returns {integer}
   */
  static getRandomInt(min: number, max: number): any;

  static getObjectValue(obj: object, name: string): any;

  static getParents(obj: any, isClass: boolean = false): string[];

  static isChildOf(obj: any, className: string, isClass: boolean = false): boolean;
}
