import { AbstractState } from '@core/animpack/state/AbstractState';
import { StateContainerMixin } from '@core/animpack/state/StateContainerMixin';
import { AnimationPlayerMixin } from '@core/animpack/AnimationPlayerMixin';
import { Utils } from '@core/Utils';

/**
 * Class for playing random animations at random intervals within this state.
 *
 * @extends AbstractState
 * @extends StateContainerMixin
 * @extends AnimationPlayerMixin
 *
 * @property {number} _playInterval - Play Interval.
 */
export declare class RandomAnimationState extends AnimationPlayerInterface.Mixin(StateContainerInterface.Mixin(AbstractState)) {
  // TODO: Fix P2. Make properties starting with '_' private
  public _playInterval: number;

  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the container state.
   * @param {number} [options.playInterval=3] - The base animation playback interval.
   * @param {Array.<AbstractState>} [subStates=[]] - states to be randomly picked to play
   */
  constructor(options: any = {}, subStates: AbstractState[] = []);

  /**
   * Get and sets the base animation play interval
   *
   * @type {number}
   */
  get playInterval(): number;

  set playInterval(playInterval: number);

  /**
   * Reset the internal timer for animation play interval
   *
   * @private
   */
  _resetTimer();

  /**
   * Multiplies the weight of each sub-state by a factor to determine the internal weight.
   *
   * @private
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);

  /**
   * Pick a random animation and utilize AnimationPlayerMixin to play that animation
   *
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   */
  playRandomAnimation(onError?: any);

  /**
   * Play the animation in the queue.
   *
   * @param {Function=} onFinish - Function to execute each time an animation finish.
   * @param {Function=} onError - Function to execute each time an animation errors.
   * @param {Function=} onCancel - Function to execute each time an animation cancels.
   *
   * @returns {Deferred}
   */
  play(onFinish?: any, onError?: any, onCancel?: any): any;

  /**
   * Pause the animation in the queue.
   *
   * @returns {boolean}
   */
  pause(): boolean {
    return super.pause() && this.pauseAnimation();
  }

  /**
   * Resume the animation in the queue.
   *
   * @param {Function=} onFinish - Function to execute each time an animation finish.
   * @param {Function=} onError - Function to execute each time an animation errors.
   * @param {Function=} onCancel - Function to execute each time an animation cancels.
   *
   * @returns {Deferred}
   */
  resume(onFinish?: any, onError?: any, onCancel?: any): any;

  /**
   * Cancel the animation in the queue.
   *
   * @returns {boolean}
   */
  cancel(): boolean;

  /**
   * Stop the animation in the queue.
   *
   * @returns {boolean}
   */
  stop(): boolean;

  /**
   * Discard the animation in the queue.
   *
   * @returns {any}
   */
  discard(): any;
}
