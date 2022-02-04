import {Deferred} from '@core/Deferred';
import {AbstractState} from '@core/animpack/state/AbstractState';
import {validateBlendMode} from '@core/animpack/AnimationLayer';
import {AnimationUtils} from '@core/animpack/AnimationUtils';

/**
 * Class for playing a single animation clip.
 *
 * @extends AbstractState
 * @alias core/SingleState
 */
export class SingleState extends AbstractState {
  private _timeScale: number;
  private _loopCount: number;
  private _blendMode: string;

  /**
   * @constructor
   *
   * @property {number} _timeScale - Factor to scale the playback speed of the animation.
   * @property {number} _loopCount - Number of times the animation should repeat before finishing.
   * @property {string} _blendMode - Type of blending the animation should use.
   *
   * @param {Object=} options - Options for the animation state.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {weight} [options.weight=0] - The 0-1 amount of influence the state will have.
   * @param {timeScale} [options.timeScale=1] - Factor to scale the playback speed of the animation.
   * @param {number} [options.loopCount=Infinity] - Number of times the animation should repeat before finishing.
   * @param {string} [options.blendMode=DefaultLayerBlendMode] - Type of blending the animation should use.
   */
  constructor(options: any = {});

  /**
   * Get the normalized playing time of the current animation
   *
   * @type {number}
   */
  get normalizedTime(): number;

  /**
   * Set the normalized playing time of the current animation
   *
   * @type {number}
   */
  set normalizedTime(time: number);

  /**
   * Get the a factor to scale animation playback speed with.
   *
   * @type {number}
   */
  get timeScale(): number;

  /**
   * Set the a factor to scale animation playback speed with.
   *
   * @type {number}
   */
  set timeScale(timeScale: number);

  /**
   * Get whether or not the timeScale is currently being animated.
   *
   * @readonly
   * @type {boolean}
   */
  get timeScalePending(): boolean;

  /**
   * Updates the timeScale value over time.
   *
   * @param {number} weight - The target timeScale value.
   * @param {number} [seconds=0] - The amount of time it will take to reach the target timeScale.
   * @param {Function=} easingFn - The easing function to use for interpolation.
   *
   * @returns {Deferred}
   */
  setTimeScale(timeScale: any, seconds: number = 0, easingFn?: any); // : Deferred;

  /**
   * Get the number of times the animation will repeat before finishing.
   *
   * @type {number}
   */
  get loopCount(): number;

  /**
   * Set the number of times the animation will repeat before finishing.
   *
   * @type {number}
   */
  set loopCount(loopCount: number);

  /**
   * Get the type of blending used for the animation.
   *
   * @readonly
   * @type {string}
   */
  get blendMode(): string;
}
