/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
import {AnimationFeatureDependentInterface} from '@core/animpack/AnimationFeatureDependentInterface';
import {HostObject} from '@core/HostObject';

/**
 * Class factory interface for that keeps track of layers and animations on a host.
 * Tracked assets are marked as inactive until layers and animations with matching
 * names are detected as present on the host.
 *
 * @interface
 * @extends AnimationFeatureDependentInterface
 *
 * @property {HostObject} _host - The HostObject managing the feature.
 * @property {any} _managedLayers - Managed Layers.
 * @property {Function} _onLayerAdded - On Layer Added fn.
 * @property {Function} _onLayerRemoved - On Layer Removed fn.
 * @property {Function} _onAnimationAdded - On Animation Added fn.
 * @property {Function} _onAnimationRemoved - On Animation Removed fn..
 *
 * @property {Object} DEFAULT_LAYER_OPTIONS - Default options to use when executing {@link AnimationLayer} methods.
 * @property {number} [DEFAULT_LAYER_OPTIONS.blendTime=0.5] - Default time in seconds to use when executing {@link AnimationLayer.setBlendWeight}.
 * @property {Object} [DEFAULT_LAYER_OPTIONS.animations={}] - Maps animation names to default options objects to use for managed animations.
 */
export declare class ManagedAnimationLayerInterface extends AnimationFeatureDependentInterface {
  /**
   * Start tracking keeping track of whether a layer with the given name is present on the host.
   *
   * @param {string} name - Name of the layer to keep track of.
   * @param {Object=} options - Options for the layer.
   * @param {number=} options.blendTime - Default amount of time to use when manipulating layer weights on this layer.
   * @param {Function=} options.easingFn - Default easing function to use when manipulating layer weights on this layer.
   * @param {Object=} options.animations - Animations to keep track of on the layer. Animations are represented as key/value pairs of animation names and their options.
   */
  registerLayer(name: string, options: any = {});

  /**
   * Start tracking keeping track of whether an animation with the given name is present on the host.
   *
   * @param {string} layerName - Name of the layer that will own the animation.
   * @param {string} animationName - Name of the animation to keep track of.
   * @param {Object=} options - Options for the animation.
   */
  registerAnimation(layerName: string, animationName: string, options: any = {});

  /**
   * Set layer weights on tracked layers.
   *
   * @param {Function=} nameFilter - Predicate function to test each tracked layer with. By default all layers will pass.
   * @param {number} weight - Weight value to set on layers.
   * @param {number=} seconds - Number of seconds it will take to reach the weight on each layer. If undefined, each layers' blendTime option is used.
   * @param {Function=} easingFn - Easing function to use when setting weight on each layer. If undefined, each layers' easingFn option is used.
   */
  setLayerWeights(nameFilter: any = () => true, weight?: number, seconds?: number, easingFn?: any);

  /**
   * Set all tracked layers' weights to 1.
   *
   * @param {number=} seconds - Number of seconds it will take to reach the weight on each layer. If undefined, each layers' blendTime option is used.
   * @param {Function=} easingFn - Easing function to use when setting weight on each layer. If undefined, each layers' easingFn option is used.
   */
  enable(seconds?: number, easingFn?: any);

  /**
   * Set all tracked layers' weights to 0.
   *
   * @param {number=} seconds - Number of seconds it will take to reach the weight on each layer. If undefined, each layers' blendTime option is used.
   * @param {Function=} easingFn - Easing function to use when setting weight on each layer. If undefined, each layers' easingFn option is used.
   */
  disable(seconds?: number, easingFn?: any);

  /**
   * Creates a class that implements {@link ManagedAnimationLayerInterface} and extends a specified base class.
   *
   * @param {Class} BaseClass - The class to extend.
   *
   * @return {Class} A class that extends `BaseClass` and implements {@link ManagedAnimationLayerInterface}.
   */
  static Mixin(BaseClass);
}
