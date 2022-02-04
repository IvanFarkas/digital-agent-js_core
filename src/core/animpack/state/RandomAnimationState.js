import { AbstractState } from '@core/animpack/state/AbstractState';
import { StateContainerInterface } from '@core/animpack/state/StateContainerInterface';
import { AnimationPlayerInterface } from '@core/animpack/AnimationPlayerInterface';
import { Utils } from '@core/Utils';

/**
 * Class for playing random animations at random intervals within this state.
 *
 * @extends AbstractState
 * @implements AnimationPlayerInterface
 * @implements StateContainerInterface
 *
 * @property {number} _playInterval - Play Interval.
 */
export class RandomAnimationState extends AnimationPlayerInterface.Mixin(StateContainerInterface.Mixin(AbstractState)) {
  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the container state.
   * @param {number} [options.playInterval=3] - The base animation playback interval.
   * @param {Array.<AbstractState>} [subStates=[]] - states to be randomly picked to play
   */
  constructor(options = {}, subStates = []) {
    super(options);

    this._playInterval = options.playInterval ? options.playInterval : 3;

    subStates.forEach((state) => {
      this.addState(state);
    });
  }

  /**
   * Gets and sets the base animation play interval
   *
   * @type {number}
   */
  get playInterval() {
    return this._playInterval;
  }

  set playInterval(playInterval) {
    this._playInterval = playInterval;
  }

  /**
   * Reset the internal timer for animation play interval
   *
   * @private
   */
  _resetTimer() {
    const playTimer = Utils.getRandomFloat(this._playInterval / 4, this._playInterval * 2);
    const onFinish = () => {
      this.playRandomAnimation(this._playCallbacks.onError);
    };
    this._promises.timer = Utils.wait(playTimer, { onFinish });
  }

  /**
   * Multiplies the weight of each sub-state by a factor to determine the internal weight.
   *
   * @private
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor) {
    super.updateInternalWeight(factor);

    if (this._currentState) {
      this._currentState.updateInternalWeight(this._internalWeight);
    }
  }

  /**
   * Pick a random animation and utilize AnimationPlayerInterface to play that animation
   *
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   */
  playRandomAnimation(onError) {
    this._resetTimer();

    const states = this.getStateNames();
    if (this._currentState) {
      states.splice(states.indexOf(this._currentState.name), 1);
    }
    const randomState = states[Utils.getRandomInt(0, states.length)];

    this.playAnimation(randomState, this._transitionTime, this._easingFn, undefined, onError, undefined, undefined);
  }

  /**
   * Play the animation in the queue.
   *
   * @param {Function=} onFinish - Function to execute each time an animation finish.
   * @param {Function=} onError - Function to execute each time an animation errors.
   * @param {Function=} onCancel - Function to execute each time an animation cancels.
   *
   * @returns {Deferred}
   */
  play(onFinish, onError, onCancel) {
    this.playRandomAnimation(onError);
    return super.play(onFinish, onError, onCancel);
  }

  /**
   * Pause the animation in the queue.
   *
   * @returns {boolean}
   */
  pause() {
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
  resume(onFinish, onError, onCancel) {
    if (this._currentState) {
      this.resumeAnimation(this._currentState.name, this._transitionTime, this._easingFn, undefined, onError, undefined, undefined);
    }
    return super.resume(onFinish, onError, onCancel);
  }

  /**
   * Cancel the animation in the queue.
   *
   * @returns {boolean}
   */
  cancel() {
    return super.cancel() && this.cancelAnimation();
  }

  /**
   * Stop the animation in the queue.
   *
   * @returns {boolean}
   */
  stop() {
    return super.stop() && this.stopAnimation();
  }

  /**
   * Discard the animation in the queue.
   *
   * @returns {any}
   */
  discard() {
    super.discard();
    this.discardStates();
  }
}
