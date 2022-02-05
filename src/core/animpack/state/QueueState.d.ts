import {AbstractState} from '@core/animpack/state/AbstractState';
import {AnimationPlayerMixin} from '@core/animpack/AnimationPlayerMixin';
import {StateContainerMixin} from '@core/animpack/state/StateContainerMixin';
import {Deferred} from '@core/Deferred';

/**
 * Class for playing an ordered array of animation states in sequence.
 *
 * @extends AbstractState
 * @extends StateContainerMixin
 * @extends AnimationPlayerMixin
 *
 * @property {IterableIterator<number>} _queue - Queue.
 * @property {boolean} _done - Done.
 * @property {AbstractState} _currentState - Current State.
 * @property {number} _transitionTime - Transition Time.
 * @property {Function} _easingFn - Easing Fn.
 * @property {boolean} isTransitioning - isTransitioning.
 * @property {string} currentAnimation - currentAnimation.
 * @property {any} value - value.
 */
export declare class QueueState extends AnimationPlayerInterface.Mixin(StateContainerInterface.Mixin(AbstractState)) {
  // TODO: Fix P2. Make properties starting with '_' private
  public _queue: IterableIterator<string>;
  public _done: boolean;
  public value: any;

  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the state.
   * @param {boolean} [options.autoAdvance=true] - Whether to autmatically advance to the next state in the queue as each state completes.
   * @param {object[]} [queueStates=[]] - Array of states to be played in order.
   */
  constructor(options: any = {}, queueStates: object[] = []);

  /**
   * Get whether the animation queue has reached the end.
   *
   * @type {boolean}
   */
  get done(): boolean;

  /**
   * Get the internal weight.
   *
   * @readonly
   * @type {number}
   */
  get internalWeight(): number;

  /**
   * Restart the queue iterator.
   *
   * @private
   *
   * @returns {any}
   */
  _reset(): any;

  /**
   * Multiplies the user weight by a factor to determine the internal weight.
   *
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);

  /**
   * Start the next animation in the queue.
   *
   * @param {Function=} onNext - Function to execute each time an animation completes and the queue moves to the next animation.
   * @param {boolean} [wrap=false] - Whether or not to start the queue from the beginning again if the end has been reached.
   *
   * @returns {Deferred}
   */
  next(onNext?: any, wrap?: boolean): any;

  /**
   * Play the animation in the queue.
   *
   * @param {Function=} onFinish - Function to execute each time an animation finish.
   * @param {Function=} onError - Function to execute each time an animation errors.
   * @param {Function=} onCancel - Function to execute each time an animation cancels.
   * @param {Function=} onNext - Function to execute each time an animation completes and the queue moves to the next animation.
   *
   * @returns {Deferred}
   */
  play(onFinish?: any, onError?: any, onCancel?: any, onNext?: any); // : Deferred;

  /**
   * Pause the animation in the queue.
   *
   * @returns {boolean}
   */
  pause(): boolean {
    const paused = super.pause();
    this.pauseAnimation();
    return paused;
  }

  /**
   * Resume the animation in the queue.
   *
   * @param {Function=} onFinish - Function to execute each time an animation finish.
   * @param {Function=} onError - Function to execute each time an animation errors.
   * @param {Function=} onCancel - Function to execute each time an animation cancels.
   * @param {Function=} onNext - Function to execute each time an animation completes and the queue moves to the next animation.
   *
   * @returns {Deferred}
   */
  resume(onFinish?: any, onError?: any, onCancel?: any, onNext?: any): any;

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
