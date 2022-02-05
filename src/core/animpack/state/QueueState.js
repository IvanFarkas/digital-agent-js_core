import { AbstractState } from '../../../core/animpack/state/AbstractState';
import { AnimationPlayerInterface } from '../../../core/animpack/AnimationPlayerInterface';
import { StateContainerInterface } from '../../../core/animpack/state/StateContainerInterface';

/**
 * Class for playing an ordered array of animation states in sequence.
 *
 * @extends AbstractState
 * @implements @AnimationPlayerInterface
 *
 * @property {any[]} _states - Array of states to be played in order.
 * @property {any} _promises - Promises. {finish: fn, weight: fn, play: fn}
 * @property {any} _playCallbacks - Play Callbacks. {onFinish: fn, onError: fn, onCancel: fn, onNext: fn}
 * @property {number} _internalWeight - Internal Weight.
 * @property {IterableIterator<number>} _queue - Queue.
 * @property {boolean} _paused - Is paused.
 * @property {boolean} _done - Done.
 * @property {AbstractState} _currentState - Current State.
 * @property {number} _transitionTime - Transition Time.
 * @property {Function} _easingFn - Easing Fn.
 * @property {string} name - Name for the animation state. Names must be unique for the container the state is applied to and should be validated at the container level. If no name is given it will default to the constructor name.
 * @property {boolean} isTransitioning - isTransitioning.
 * @property {string} currentAnimation - currentAnimation.
 * @property {any} value - value.
 * @property {Function} addState - Add State.
 * @property {Function} getState - Get State.
 * @property {Function} discardStates - Discard States.
 * @property {Function} playAnimation - Play Animation.
 * @property {Function} stopAnimation - Stop Animation.
 * @property {Function} pauseAnimation - Pause Animation.
 * @property {Function} resumeAnimation - Resume Animation.
 */
export class QueueState extends AnimationPlayerInterface.Mixin(StateContainerInterface.Mixin(AbstractState)) {
  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the state.
   * @param {boolean} [options.autoAdvance=true] - Whether to autmatically advance to the next state in the queue as each state completes.
   * @param {Array.<AbstractState>} [queueStates=[]] - Array of states to be played in order.
   */
  constructor(options = {}, queueStates = []) {
    super(options);

    queueStates.forEach((state) => {
      this.addState(state);
    });

    this._queue = this._states.keys();
    this._done = true;
  }

  /**
   * Gets whether the animation queue has reached the end.
   *
   * @type {boolean}
   */
  get done() {
    return this._done;
  }

  /**
   * Gets the internal weight.
   *
   * @readonly
   * @type {number}
   */
  get internalWeight() {
    return this._currentState ? this._currentState.internalWeight * this._internalWeight : 0;
  }

  /**
   * Restart the queue iterator.
   *
   * @private
   *
   * @returns {any}
   */
  _reset() {
    this._queue = this._states.keys();
    const { value, done } = this._queue.next();
    this._done = done;

    return value || null;
  }

  /**
   * Multiplies the user weight by a factor to determine the internal weight.
   *
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor) {
    super.updateInternalWeight(factor);

    if (this._currentState) {
      this._currentState.updateInternalWeight(this._internalWeight);
    }
  }

  /**
   * Start the next animation in the queue.
   *
   * @param {Function=} onNext - Function to execute each time an animation completes and the queue moves to the next animation.
   * @param {boolean} [wrap=false] - Whether or not to start the queue from the beginning again if the end has been reached.
   *
   * @returns {Deferred}
   */
  next(onNext, wrap = false) {
    // Move the queue forward
    const { value: name, done } = this._queue.next();
    this._done = done;
    this._paused = false;

    // The queue has reached the end
    if (done) {
      // Start the queue over
      if (wrap) {
        return this.play(this._playCallbacks.onFinish, this._playCallbacks.onError, this._playCallbacks.onCancel, onNext);
      }
      // Stop the queue
      else {
        this._promises.finish.resolve();
        return this._promises.finish;
      }
    }

    // Signal the next animation is starting
    if (typeof onNext === 'function') {
      const lastName = [...this._states.keys()][this._states.size - 1];
      const isQueueEnd = name === lastName;
      onNext({
        name,
        canAdvance: this.getState(name).loopCount !== Infinity && !isQueueEnd,
        isQueueEnd,
      });
    }

    // Start the next animation
    this.playAnimation(
      name,
      this._transitionTime,
      this._easingFn,
      () => {
        if (!this._paused && !this.isTransitioning) {
          this.next(onNext);
        }
      },
      this._playCallbacks.onError
    );

    return this._promises.finish;
  }

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
  play(onFinish, onError, onCancel, onNext) {
    const name = this._reset();
    super.play(onFinish, onError, onCancel);

    if (this._done) {
      this._promises.finish.resolve();
    } else {
      // Signal the next animation is starting
      if (name !== this.currentAnimation && typeof onNext === 'function') {
        const lastName = [...this._states.keys()][this._states.size - 1];
        const isQueueEnd = name === lastName;
        onNext({
          name,
          canAdvance: name ? this.getState(name).loopCount !== Infinity && !isQueueEnd : true,
          isQueueEnd: !name || isQueueEnd,
        });
      }

      // Start the next animation
      this.playAnimation(
        name,
        this._currentState ? this._transitionTime : 0,
        this._easingFn,
        () => {
          if (!this._paused && !this.isTransitioning) {
            this.next(onNext);
          }
        },
        onError
      );
    }

    return this._promises.finish;
  }

  /**
   * Pause the animation in the queue.
   *
   * @returns {boolean}
   */
  pause() {
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
  resume(onFinish, onError, onCancel, onNext) {
    if (this._done) {
      return this.play(onFinish, onError, onCancel, onNext);
    } else {
      super.resume(onFinish, onError, onCancel);

      this.resumeAnimation(
        this._currentState.name,
        this._transitionTime,
        this._easingFn,
        () => {
          if (!this._paused && !this.isTransitioning) {
            this.next(onNext);
          }
        },
        onError
      );

      return this._promises.finish;
    }
  }

  /**
   * Cancel the animation in the queue.
   *
   * @returns {boolean}
   */
  cancel() {
    const canceled = super.cancel();

    if (this._currentState) {
      this._currentState.cancel();
    }

    return canceled;
  }

  /**
   * Stop the animation in the queue.
   *
   * @returns {boolean}
   */
  stop() {
    const stopped = super.stop();
    this.stopAnimation();
    this._done = true;

    return stopped;
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
