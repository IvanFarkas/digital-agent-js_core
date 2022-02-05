import {Deferred} from '@core/Deferred';
import {AbstractState} from '@core/animpack/state/AbstractState';

/**
 * Class for smooth transitioning between states on an animation layer.
 *
 * @extends AbstractState
 *
 * @property {any} _to - To state.
 * @property {any[]} _from - From state.
 * @property {any} _weightPromise - Weight Promise.
 */
export declare class TransitionState extends AbstractState {
  // TODO: Fix P2. Make properties starting with '_' private
  public _to: any;
  public _from: any[];
  public _weightPromise: any;

  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the container state.
   */
  constructor(options?: any);

  /**
   * Get internal Weight
   *
   * @type {number}
   */
  get internalWeight(): number;

  /**
   * Update Internal Weight.
   *
   * @param {number} factor - Factor.
   */
  updateInternalWeight(factor: number);

  /**
   * Update sub-states the transition is controlling and start new weight animations on each one. This should be called each time the current state of an animation layer gets updated to a new value and a transition time greater that zero is specified.
   *
   * @param {Array.<AbstractState>} [currentStates=[]] - States whose weight values will be animated to 0.
   * @param {AbstractState=} targetState - State whose weight will be animated to 1.
   * @param {number} transitionTime - Amount of time it will in seconds take for weight animations to complete.
   * @param {Function=} easingFn - Easing function to use for weight animations. Default is Easing.Linear.InOut.
   * @param {Function=} onComplete - Function to execute once all weight animations complete.
   */
  configure(currentStates: any[] = [], targetState: any, transitionTime: number, easingFn?: any, onComplete?: any);

  /**
   * Start new weight animations state the transition controls. This should be called if an animation is played with a transition time greater than zero and a transtion to that animation was already in progress.
   *
   * @param {number} transitionTime - Amount of time it will in seconds take for weight animations to complete.
   * @param {Function=} easingFn - Easing function to use for weight animations. Default is Easing.Linear.InOut.
   * @param {Function=} onComplete - Function to execute once all weight animations complete.
   */
  reset(transitionTime: number, easingFn: any, onComplete: any);

  play(onFinish?: any, onError?: any, onCancel?: any, onNext?: any);

  /**
   * Play the animation in the queue.
   *
   * @param {Function=} onFinish - Function to execute each time an animation finish.
   * @param {Function=} onError - Function to execute each time an animation errors.
   * @param {Function=} onCancel - Function to execute each time an animation cancels.
   * @param {Function=} onNext - Function to execute each time an animation completes and the queue moves to the next animation.
   *
   * @returns {boolean}
   */
  pause(): boolean;

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
  resume(onFinish?: any, onError?: any, onCancel?: any, onNext?: any); // : Deferred;

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
   * Update the animation in the queue.
   *
   * @param {number} deltaTime - Time in milliseconds since the last update.
   */
  update(deltaTime: number);

  /**
   * Discard the animation in the queue.
   */
  discard();

  /**
   * Deactivate the animation in the queue.
   */
  deactivate();
}
