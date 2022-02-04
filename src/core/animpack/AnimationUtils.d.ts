import {Deferred} from '@core/Deferred';
import {Utils} from '@core/Utils';
import {MathUtils} from '@core/MathUtils';
import {Linear} from '@core/animpack/Easing';

/**
 * A collection of useful animation functions.
 *
 * @hideconstructor
 */
export class AnimationUtils {
  /**
   * Clamp a number between 2 values.
   *
   * @param {number} from - From.
   * @param {number} to - To.
   * @param {number} factor - Factor.
   *
   * @returns {number}
   */
  static lerp(from: number, to: number, factor: number): number;

  /**
   * Clamp a number between 2 values.
   *
   * @param {number} value - Value to clamp.
   * @param {number} [min=0] - Minumum value.
   * @param {number} [max=1] - Maximum value.
   *
   * @returns {number}
   */
  static clamp(value: number, min: number = 0, max: number = 1): number;

  /**
   * Return a deferred promise that can be used to update the value of a numeric property of this object over time. Pass delta time in milliseconds to the deferred promise's execute method in an update loop to animate the property towards the target value.
   *
   * @param {Object} propertyOwner - Object that contains the property to animation.
   * @param {string} propertyName - Name of the property to animate.
   * @param {number} targetValue - Target value to reach.
   * @param {Object=} options - Optional options object
   * @param {number} [options.seconds=0] - Number of seconds it will take to reach the target value.
   * @param {Function} [options.easingFn=Linear.InOut] - Easing function to use for animation.
   * @param {Function} [options.onFinish] - Callback to execute once the animation completes. The target value is passed as a parameter.
   * @param {Function=} options.onProgress - Callback to execute each time the animation property is updated during the animation. The property's value at the time of the update is passed as a parameter.
   * @param {Function=} options.onCancel - Callback to execute if the user cancels the animation before completion. The animation property's value at the time of cancel is passed as a parameter.
   * @param {Function=} options.onError - Callback to execute if the animation stops because an error is encountered. The error message is passed as a parameter.
   *
   * @returns {Deferred} Resolves with the property's value once it reaches the target value.
   */
  static interpolateProperty(propertyOwner?: any, propertyName?: string, targetValue?: number, {seconds = 0, easingFn, onFinish, onProgress, onCancel, onError}: any = {}): any; // Deferred | Promise<void | number>;
}
