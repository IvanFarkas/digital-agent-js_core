import {MathUtils} from '@core/MathUtils';
import {Deferred} from '@core/Deferred';
import {AnimationUtils} from '@core/animpack/AnimationUtils';

/**
 * Base class for a state in our animation system.
 *
 * @abstract
 *
 * @property {any[]} _states - States.
 * @property {number} _weight - The 0-1 amount of influence the state will have.
 * @property {number} _internalWeight - Internal Weight.
 * @property {boolean} _paused - Is paused.
 * @property {any} _promises - Promises. {finish: fn, weight: fn, play: fn} TODO: Make it private
 * @property {any} _playCallbacks - Play Callbacks. {onFinish: fn, onError: fn, onCancel: fn}
 * @property {string} name - Name for the animation state. Names must be unique for the container the state is applied to and should be validated at the container level. If no name is given it will default to the constructor name.
 */
export class AbstractState {
  // TODO: Fix P2
  // export abstract class AbstractState {
  // TODO: Fix P2. Make properties starting with '_' private
  public _weight: number;
  public _internalWeight: number;
  public _paused: boolean;
  public _discarded: boolean;
  public _promises: IPromises;
  public _playCallbacks: IPlayCallbacks;
  public name: string;

  /**
   * @constructor
   *
   * @param {Object=} options - Options for the animation state.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the container the state is applied to and should be validated at the container level. If no name is given it will default to the constructor name.
   * @param {weight} [options.weight=0] - The 0-1 amount of influence the state will have.
   */
  constructor(options: any = {});

  /**
   * Gets whether or not the state is currently paused.
   *
   * @type {boolean}
   */
  get paused(): boolean;

  /**
   * Gets and sets the user defined weight.
   *
   * @type {number}
   */
  get weight(): number;

  set weight(weight): number;

  /**
   * Gets whether or not the weight is currently being animated.
   *
   * @readonly
   * @type {boolean}
   */
  get weightPending(): boolean;

  /**
   * Updates the user defined weight over time.
   *
   * @param {number} weight - The target weight value.
   * @param {number} [seconds=0] - The amount of time it will take to reach the target weight.
   * @param {Function=} easingFn - The easing function to use for interpolation.
   *
   * @returns {Deferred}
   */
  setWeight(weight: number, seconds?: number, easingFn?: any);

  /**
   * Gets the internal weight.
   *
   * @readonly
   * @type {number}
   */
  get internalWeight(): number;

  /**
   * Get promises
   *
   * @type {any}
   */
  get promises();

  /**
   * Set promises
   *
   * @type {number}
   */
  set promises(promises: any);

  /**
   * Multiplies the user weight by a factor to determine the internal weight.
   *
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);

  /**
   * Update any values that need to be evaluated every frame.
   *
   * @param {number} deltaTime - Time in milliseconds since the last update.
   */
  update(deltaTime: number);

  /**
   * Start playback of the state from the beginning.
   *
   * @param {Function=} onFinish - Function to execute when the state finishes.
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   * @param {Function=} onCancel - Function to execute if playback is canceled.
   *
   * @returns {Deferred}
   */
  play(onFinish?: any, onError?: any, onCancel?: any);

  /**
   * Pause playback of the state. This prevents pending promises from being executed.
   *
   * @returns {boolean}
   */
  pause(): boolean;

  /**
   * Resume playback of the state.
   *
   * @param {Function=} onFinish - Function to execute when the state finishes.
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   * @param {Function=} onCancel - Function to execute if playback is canceled.
   *
   * @returns {Deferred}
   */
  resume(onFinish?: any, onError?: any, onCancel?: any);

  /**
   * Cancel playback of the state and cancel any pending promises.
   *
   * @returns {boolean}
   */
  cancel(): boolean;

  /**
   * Stop playback of the state and resolve any pending promises.
   *
   * @returns {boolean}
   */
  stop(): boolean;

  /**
   * Cancel any pending promises and remove reference to them.
   */
  discard();

  /**
   * Force the internal weight to 0. Should be called before switching or transitioning to a new state.
   */
  deactivate();
}
