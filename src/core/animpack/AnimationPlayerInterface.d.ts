/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */
/* eslint-disable getter-return */
/* eslint-disable no-useless-constructor */
import { TransitionState } from '@core/animpack/state/TransitionState';
import { Deferred } from '@core/Deferred';

/**
 * Class factory interface for controlling playback of a collection of animations. One animation can be played at any given time, crossfading between animations will result in playing a {@link TransitionState}.
 *
 * @interface
 *
 * @property {boolean} _paused - Is paused.
 * @property {TransitionState} _transitionState - Transition State.
 * @property {Map} _states - States.
 * @property {TransitionState} _currentState - Current State.
 * @property {number} _transitionTime - Transition Time.
 * @property {Function} _easingFn - Easing Fn.
 * @property {number} _internalWeight - Internal Weight.
 */
export declare class AnimationPlayerInterface {
  /**
   * Gets whether or not the player is updating states.
   *
   * @readonly
   * @type {boolean}
   */
  get paused(): boolean;

  /**
   * Gets the default number of seconds it takes to transition to a new animation.
   *
   * @type {number}
   */
  get transitionTime(): number;

  /**
   * Sets the default number of seconds it takes to transition to a new animation.
   *
   * @type {number}
   */
  set transitionTime(seconds: number);

  /**
   * Gets the default easing function to use when transitioning and setting weights.
   *
   * @type {Function}
   */
  get easingFn(): any;

  /**
   * Sets the default easing function to use when transitioning and setting weights.
   *
   * @type {Function}
   */
  set easingFn(fn: any);

  /**
   * Gets the state the layer is currently in control of.
   *
   * @readonly
   * @type {AbstractState}
   */
  get currentState(): AbstractState;

  /**
   * Gets the name of the state the layer is currently in control of.
   *
   * @readonly
   * @type {string}
   */
  get currentAnimation(): string;

  /**
   * Gets whether or not the layer is currently transitioning to a new animation.
   *
   * @readonly
   * @type {boolean}
   */
  get isTransitioning(): boolean;

  /**
   * Update the layer's current state to a new value. If transitionTime is defined and greater than zero, perform a smooth blend between any states that currently have non-zero weight values and the new state.
   *
   * @private
   *
   * @param {(string|null)} name - Name of the state to transition to.
   * @param {string} playMethod - Name of the operation being prepared for, to be used in error messaging.
   * @param {number=} transitionTime - Amount of time in seconds it will take to switch to the new state.
   * @param {Function=} easingFn - Easing function to use when transitioning to a new state over time.
   * @param {Function=} onError - Function to execute if an error is encountered.
   */
  _prepareCurrentState(name: string, playMethod: string, transitionTime: number, easingFn?: any, onError?: any);

  /**
   * Start playback an animation from the beginning.
   *
   * @param {string} name - Name of the animation to play.
   * @param {number=} transitionTime - Amount of time it will take before the new state has full influence for the layer.
   * @param {Function=} easingFn - Easing function to use for blending if transitionTime is greater than zero.
   * @param {Function=} onFinish - Function to execute when the animation finishes.
   * @param {Function=} onError - Function to execute if the animation encounters an error during playback.
   * @param {Function=} onCancel - Function to execute if playback is canceled.
   * @param {Function=} onNext - Function to execute if an animation queue is played and it advances to the next animation.
   *
   * @returns {Deferred}
   */
  playAnimation(name: string, transitionTime?: number, easingFn?: any, onFinish?: any, onError?: any, onCancel?: any, onNext?: any): any; // Deferred | Promise<never>

  /**
   * Cancel playback of the current animation.
   *
   * @returns {boolean}
   */
  cancelAnimation(): boolean;

  /**
   * Pause playback of the current animation.
   *
   * @returns {boolean}
   */
  pauseAnimation(): boolean;

  /**
   * Resume playback of an animation.
   *
   * @param {string=} name - Name of the animation to resume playback for. Default is the layer's current animation name.
   * @param {number=} transitionTime - Amount of time it will take before the new state has full influence for the layer.
   * @param {Function=} onFinish - Function to execute when the state finishes.
   * @param {Function=} onError - Function to execute if the state encounters an error during playback.
   * @param {Function=} onCancel - Function to execute if playback is canceled.
   * @param {Function=} onNext - Function to execute if an animation queue is played and it advances to the next animation.
   *
   * @returns {Deferred}
   */
  resumeAnimation(name?: string, transitionTime?: number, easingFn?: any, onFinish?: any, onError?: any, onCancel?: any, onNext?: any): any; // Deferred | Promise<never> {

  /**
   * Stop playback of the current animation.
   *
   * @returns {boolean}
   */
  stopAnimation(): boolean;

  /**
   * Update the current animation.
   *
   * @param {number} deltaTime - Time in milliseconds since the last update.
   */
  update(deltaTime: number);

  /**
   * Discard the transition state.
   */
  discard();

  /**
   * Creates a class that implements {@link AnimationPlayerInterface} and extends a specified base class.
   *
   * @param {Class} [BaseClass = class{}] - The class to extend.
   *
   * @return {Class} A class that extends `BaseClass` and implements {@link AnimationPlayerInterface}.
   */
  static Mixin(BaseClass = class {});
}
