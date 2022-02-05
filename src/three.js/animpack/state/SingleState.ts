import {AnimationAction, NormalAnimationBlendMode, AdditiveAnimationBlendMode, LoopOnce, LoopRepeat} from 'three';
import {MathUtils} from '../../../core/MathUtils';
import {Deferred} from '../../../core/Deferred';
import {SingleState as CoreSingleState} from '../../../core/animpack/state/SingleState';

/**
 * Threejs AnimationAction object
 * @external "THREE.AnimationAction"
 * @see https://threejs.org/docs/#api/en/animation/AnimationAction
 */

const threeBlendModes = {
  Override: NormalAnimationBlendMode,
  Additive: AdditiveAnimationBlendMode,
};

/**
 * @extends core/SingleState
 * @alias three.js/SingleState
 *
 * @property {Function=} _onFinishedEvent - On Finished Event.
 * @property {AnimationAction} _threeAction - THREE Animation Action.
 */
export class SingleState extends CoreSingleState {
  // TODO: Make private. Add getters
  public _threeAction: AnimationAction;
  public _onFinishedEvent: any;

  /**
   * @constructor
   *
   * @param {Object=} options - Options for the animation state.
   * @param {AnimationAction} threeAction - Animation action that controls playback of the clip.
   */
  constructor(options: any = {}, threeAction: AnimationAction) {
    super(options);

    // Callback to catch THREE animation action completion
    this._onFinishedEvent = ({type, action}: {type: string; action: AnimationAction}) => {
      // Exit if this isn't the finish event for this animation
      if (type !== 'finished' || action !== this.threeAction) {
        return;
      }
      this._promises.play.resolve();

      // Stop evaluating interpolators if they have already completed
      if (!this.weightPending && !this.timeScalePending) {
        this._paused = true;
      }
    };

    this._threeAction = threeAction;
    this._threeAction.clampWhenFinished = true; // Hold the last frame on completion
    this._threeAction.enabled = false;
    this._threeAction.loop = this.loopCount === 1 ? LoopOnce : LoopRepeat;
    this._threeAction.paused = this._paused;
    this._threeAction.repetitions = this.loopCount;
    this._threeAction.timeScale = this.timeScale;
    this._threeAction.weight = this._internalWeight;
    // TODO: Validate
    // this._threeAction.blendMode = threeBlendModes[this.blendMode];
    this._threeAction.blendMode = threeBlendModes[this.blendMode as keyof typeof threeBlendModes];

    // Start listening for animation finished events
    this._threeAction.getMixer().addEventListener('finished', this._onFinishedEvent);
  }

  /**
   * Get the AnimationAction object.
   *
   * @readonly
   * @type {AnimationAction}
   */
  get threeAction(): AnimationAction {
    return this._threeAction;
  }

  /**
   * Get normalized Time.
   *
   * @type {number}
   */
  get normalizedTime(): number {
    if (this._threeAction.time && this._threeAction.getClip() && this._threeAction.getClip().duration) {
      return this._threeAction.time / this._threeAction.getClip().duration;
    }
    return 0;
  }

  /**
   * Set normalized Time.
   *
   * @type {number}
   */
  set normalizedTime(time: number) {
    time = MathUtils.clamp(time);
    this._threeAction.time = this._threeAction.getClip().duration * time;
  }

  /**
   * Get weight.
   *
   * @type {number}
   */
  get weight(): number {
    return super.weight;
  }

  /**
   * Set weight.
   *
   * @type {number}
   */
  set weight(weight: number) {
    super.weight = weight;
    this._threeAction.enabled = true;
  }

  /**
   * Multiplies the user weight by a factor to determine the internal weight.
   *
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number) {
    super.updateInternalWeight(factor);
    this._threeAction.setEffectiveWeight(this._internalWeight);
  }

  /**
   * Get the a factor to scale animation playback speed with.
   *
   * @type {number}
   */
  get timeScale(): number {
    return super.timeScale;
  }

  /**
   * Set the a factor to scale animation playback speed with.
   *
   * @type {number}
   */
  set timeScale(timeScale: number) {
    super.timeScale = timeScale;
    this._threeAction.timeScale = timeScale;
  }

  /**
   * Get the number of times the animation will repeat before finishing.
   *
   * @type {number}
   */
  get loopCount(): number {
    return super.loopCount;
  }

  /**
   * Set the number of times the animation will repeat before finishing.
   *
   * @type {number}
   */
  set loopCount(loopCount: number) {
    super.loopCount = loopCount;
    this._threeAction.loop = loopCount === 1 ? LoopOnce : LoopRepeat;
    this._threeAction.repetitions = loopCount;
  }

  /**
   * Start playback of the sub-states from the beginning.
   *
   * @param {Function=} onFinish - Function to execute when the state finishes.
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   * @param {Function=} onCancel - Function to execute if playback is canceled.
   *
   * @returns {Deferred}
   */
  play(onFinish?: any, onError?: any, onCancel?: any): Deferred | Promise<never> {
    // Restart animation
    this._threeAction.reset();
    this._threeAction.play();
    return super.play(onFinish, onError, onCancel);
  }

  /**
   * Pause playback of the sub-states. This prevents pending promises from being executed.
   *
   * @returns {boolean}
   */
  pause(): boolean {
    // Make sure animation has influence
    this._threeAction.paused = true;
    this._threeAction.play();
    return super.pause();
  }

  /**
   * Resume playback of the sub-states.
   *
   * @param {Function=} onFinish - Function to execute when the state finishes.
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   * @param {Function=} onCancel - Function to execute if playback is canceled.
   *
   * @returns {Deferred}
   */
  resume(onFinish?: any, onError?: any, onCancel?: any): Deferred | Promise<never> {
    // Make sure the animation can play and has influence
    this._threeAction.paused = false;
    this._threeAction.enabled = true;
    this._threeAction.play();
    return super.resume(onFinish, onError, onCancel);
  }

  /**
   * Cancel playback of the sub-states and cancel any pending promises.
   *
   * @returns {boolean}
   */
  cancel(): boolean {
    // Stop animation playback
    this._threeAction.paused = true;
    return super.cancel();
  }

  /**
   * Stop playback of the sub-states and resolve any pending promises.
   *
   * @returns {boolean}
   */
  stop(): boolean {
    // Restart and pause the animation
    this._threeAction.reset();
    this._threeAction.paused = true;
    this._threeAction.play();
    return super.stop();
  }

  /**
   * Discards all sub-state resources.
   */
  discard() {
    // Stop the animation from having influence
    this._threeAction.enabled = false;

    // Stop listening for finish events
    this._threeAction.getMixer().removeEventListener('finished', this._onFinishedEvent);

    super.discard();
  }
}
