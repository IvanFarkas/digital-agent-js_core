import {MathUtils} from '@core/MathUtils';
import {AbstractBlendState} from '@core/animpack/state/AbstractBlendState';
import {AnimationPlayerMixin} from '@core/animpack/AnimationPlayerMixin';
import {AnimationUtils} from '@core/animpack/AnimationUtils';
import {Deferred} from '@core/Deferred';
import {StateContainerMixin} from '@core/animpack/state/StateContainerMixin';
import {MixinBase} from '@core/MixinBase';

/**
 * Enum for types of {@link AnimationLayer} blending.
 *
 * @readonly
 * @enum {string}
 */
export declare const LayerBlendModes: {Override: string; Additive: string};

/**
 * The default blending mode {@link AnimationLayer}.
 *
 * @readonly
 * @type {string}
 */
export declare const DefaultLayerBlendMode: string;

/**
 * Checks if a given blendMode is present in the values of {@link LayerBlendModes}.
 * If it is, return the original value, otherwise return {@link DefaultLayerBlendMode}.
 *
 * @param {string} blendMode - The name of the type of blending.
 *
 * @returns {(string|DefaultLayerBlendMode)}
 */
export function validateBlendMode(blendMode: string);

/**
 * Class for managing a set of animations where only one state can be active at any given time.
 *
 * @extends AnimationPlayerMixin
 * @extends StateContainerMixin
 *
 * @property {Object[]} _blendMode - Blend Mode.
 * @property {any} _promises - Promises.
 * @property {boolean} _weightPaused - Is weight paused.
 * @property {number} _weight - Weight.
 * @property {string} name - Name.
 */
export declare class AnimationLayer extends AnimationPlayerInterface.Mixin(StateContainerInterface.Mixin()) {
  // TODO: Make it private, add getter
  public _blendMode: LayerBlendMode;
  public _promises: any;
  public _weightPaused: boolean;
  public _weight: number;
  public name: string;

  // TODO: Verify if _internalWeight property is in this class
  public _internalWeight: number;

  /**
   * @constructor
   *
   * @param {Object=} options - Options for the animation layer.
   * @param {string} options.name - Name of the layer. Names must be unique to the animation feature that contains the layer.
   * @param {LayerBlendMode} [options.blendMode=DefaultLayerBlendMode] - Type of blending to use for all states controlled by the layer.
   * @param {number} [options.weight=1] - The amount of influence the layer's current animation has over the result for the host.
   * @param {number} [options.transitionTime=0] - The default amount of time to use when playing and resuming animations.
   * @param {Function=} options.easingFn - The default easing function to use when transitioning between animations and setting layer weight.
   */
  constructor(...args: any[]);

  /**
   * Get the type of blending used for states controlled by the layer.
   *
   * @readonly
   * @type {LayerBlendMode}
   */
  get blendMode(): LayerBlendMode;

  /**
   * Get the amount of influence the layer's current animation has over the result for the host.
   *
   * @type {number}
   */
  set weight(weight: number);

  /**
   * Set the amount of influence the layer's current animation has over the result for the host.
   *
   * @type {number}
   */
  get weight(): number;

  /**
   * Get whether or not the layer's weight value is currently being animated.
   *
   * @readonly
   * @type {boolean}
   */
  get weightPending(): boolean;

  /**
   * Pause the current animation state and any interpolation happening on the layer's weight property.
   *
   * @returns {boolean}
   */
  pause(): boolean;

  /**
   * Resume the current animation state and any interpolation happening on the layer's weight property.
   *
   * @returns {boolean}
   */
  resume(): any; // Deferred | Promise<never> | boolean;

  /**
   * Updates the user defined weight over time.
   *
   * @param {number} weight - The target weight value.
   * @param {number} [seconds=0] - The amount of time it will take to reach the target weight.
   * @param {Function=} easingFn - The easing function to use for interpolation.
   *
   * @returns {Deferred}
   */
  setWeight(weight: number, seconds?: number, easingFn?: any): any; // Deferred;

  /**
   * Pause any interpolation happening on the layer's weight property.
   *
   * @returns {boolean}
   */
  pauseWeight(): boolean;

  /**
   * Resume any interpolation happening on the layer's weight property.
   *
   * @returns {boolean}
   */
  resumeWeight(): boolean;

  /**
   * Multiplies the user weight by a factor to determine the internal weight.
   *
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);

  /**
   * Returns the names of blend states in an animation.
   *
   * @param {string} animationName - Name of the animation.
   *
   * @returns {string[]} - Names of blend states.
   */
  getAnimationBlendNames(animationName: string): string[];

  /**
   * Update the weight for a blend state of an animation.
   *
   * @param {string} animationName - Name of the animation containing the blend state to update.
   * @param {string} blendName - Name of the blend state to update.
   * @param {number} weight - Weight value to set on the animation. This number shoudld be in the 0-1 range.
   * @param {number=} seconds - Number of seconds it should take to reach the new weight. Default is zero and will set immediately.
   * @param {Function=} easingFn - Easing function to use while interpolating the new weight. Default is Easing.Linear.InOut.
   *
   * @returns {Deferred} - Promise that will resolve once the animation's weight reaches the target value.
   */
  setAnimationBlendWeight(animationName: string, blendName: string, weight: number, seconds: number = 0, easingFn: any): any; // Deferred | Promise<never>;

  /**
   * Returns the weight for a blend state of an animation.
   *
   * @param {string} animationName - Name of the animation containing the blend state to update.
   * @param {string} blendName - Name of the blend state to retrieve the weight of.
   *
   * @returns {number} - Weight of the blend state.
   */
  getAnimationBlendWeight(animationName: string, blendName: string): number;

  /**
   * Update any weight interpolators and the current animation.
   *
   * @param {number} deltaTime - Time in milliseconds since the last update.
   */
  update(deltaTime: number);

  /**
   * Cancel any pending promises and discard states controlled by the layer.
   */
  discard();
}
