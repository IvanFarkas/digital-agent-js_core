import { ManagedAnimationLayerInterface } from 'core/animpack/ManagedAnimationLayerInterface';
import { AnimationFeature } from 'core/animpack/AnimationFeature';
import { SSMLSpeechmarkInterface } from 'core/awspack/SSMLSpeechmarkInterface';
import { HostObject } from 'core/HostObject';
import { AbstractHostFeature } from 'core/AbstractHostFeature';
import { Deferred } from 'core/Deferred';
import { Utils } from 'core/Utils';

export const DefaultGestureWords: {
  big: string[];
  heart: string[];
  in: string[];
  many: string[];
  movement: string[];
  one: string[];
  aggressive: string[];
  you: string[];
  defense: string[];
  wave: string[];
  self: string[];
};

/**
 * Gesture allows you to play animations on demand on one or more layers from script or ssml. If gesture is played that is a QueueState, the queue will automatically be progressed after a given hold time if a looping queued state is reached. Gesture layers can optionally be automatically disabled when no gesture animation is in progress.
 *
 * @extends HostFeature
 * @implements SSMLSpeechmarkMixin
 * @implements ManagedAnimationLayer
 *
 * @property {any} _managedLayers - Managed layers.
 * @property {number} holdTime - Amount of time in seconds that must elapse before advancing a gesture that's a {@link QueueState} when the current state in the queue is set to loop infinitely.
 * @property {number} minimumInterval - The minimum amount of time in seconds that must elapse before another gesture can be played.
 * @property {string} currentGesture - Current Gesture.
 */
export class GestureFeature extends AbstractHostFeature.mix(SSMLSpeechmarkInterface.Mixin, ManagedAnimationLayerInterface.Mixin) {
  public holdTime: number;
  public minimumInterval: number;

  // public static DEFAULT_LAYER_OPTIONS: any = {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   ...GestureFeature.DEFAULT_LAYER_OPTIONS,
  //   autoDisable: true,
  // };
  // public static EVENT_DEPENDENCIES: any = {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   ...GestureFeature.EVENT_DEPENDENCIES,
  //   AnimationFeature: {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     ...GestureFeature.EVENT_DEPENDENCIES.AnimationFeature,
  //     playNextAnimation: '_onNext',
  //     stopAnimation: '_onStop',
  //     interruptAnimation: '_onStop',
  //   },
  // };

  /**
   * @constructor
   *
   * @param {HostObject} host - Host object that owns the feature.
   * @param {Object=} options - Optional options for the feature.
   * @param {number} [options.holdTime=3] - Amount of time in seconds that must elapse before advancing a gesture that's a {@link QueueState} when the current state in the queue is set to loop infinitely.
   * @param {number} [options.minimumInterval=1] - The minimum amount of time in seconds that must elapse before another gesture can be played.
   * @param {Object} [options.layers={}] - An object that maps layer names to layer options. These are the layers that will be registered as tracked gesture layers. See {@link ManagedAnimationLayer#registerLayer} for more information on expected format for each layer options object.
   */
  constructor(host?: any, { holdTime = 3, minimumInterval = 1, layers }: { holdTime: number; minimumInterval: number; layers: any } = { holdTime: 3, minimumInterval: 1, layers: {} });

  /**
   * Return a valid hold time value. If hold time isn't defined for the animation, try to use the hold time for the layer. If that's not defined, fall back to the hold time for the feature.
   *
   * @private
   *
   * @param {Object} layer - Managed layer options object.
   * @param {Object} animation - Managed animation options object.
   *
   * @returns {number}
   */
  _getHoldTime(layer: any, animation: any): number;

  /**
   * Return a valid minimum interval value. If minimum interval isn't defined for the animation, try to use the minimum interval for the layer. If that's not defined, fall back to the minimum interval for the feature.
   *
   * @private
   *
   * @param {Object} layer - Managed layer options object.
   * @param {Object} animation - Managed animation options object.
   *
   * @returns {number}
   */
  _getMinimumInterval(layer: any, animation: any): number;

  /**
   * Callback for {@link AnimationFeature#playNextAnimation} event. If the event is emitted for a managed animation and the new queued state cannot advance on its own, start a new timer promise that will advance the queue once it resolves.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the queue state.
   * @param {string} animationName - Name of the queue state animation.
   * @param {boolean} canAdvance - Whether or not the current state in the queue can advance on its own.
   * @param {boolean} isQueueEnd - Whether the current state in the queue is the last state in the queue.
   */
  _onNext({ layerName, animationName, canAdvance, isQueueEnd }: { layerName: string; animationName: string; canAdvance: boolean; isQueueEnd: boolean });

  /**
   * Callback for {@link AnimationFeature#stopAnimation} event. If the event is emitted for a managed animation cancel the layer's stored timers. If the layer is set to auto-disable set its weight to 0.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the stopped animation.
   * @param {string} animationName - Name of the animation that was stopped.
   */
  _onStop({ layerName, animationName }: { layerName?: string; animationName?: string } = {});

  /**
   * Callback for {@link AnimationFeature#addAnimation} event. If the event is emitted for a managed animation cancel the layer's stored timers. If the layer is set to auto-disable set its weight to 0.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the stopped animation.
   * @param {string} animationName - Name of the animation that was stopped.
   */
  _onAnimationAdded({ layerName, animationName }: { layerName: string; animationName: string });

  /**
   * Register Layer
   *
   * @param {string} name - Name of the layer.
   * @param {Object} options - Options object passed.
   */
  registerLayer(name: string, options: any = {});

  /**
   * Register Layer
   *
   * @param {string} layerName - Name of the layer.
   * @param {string} animationName - Name of the animation.
   * @param {Object} options - Options object passed.
   */
  registerAnimation(layerName: string, animationName: string, options: any = {});

  /**
   * Create an object that maps ssml mark syntax required to play each gesture to the words array associated with each gesture. Words arrays are defined at when the gesture animation is registered. Gestures without associated words will be excluded from the result. The resulting object can be used as an input for {@link TextToSpeechUtils.autoGenerateSSMLMarks} to update a speech string with the markup required to play gestures timed with their associated words.
   *
   * @returns {Object}
   */
  createGestureMap(): any;

  /**
   * Create an array that contains ssml mark syntax required to play each gesture that does not have any associated words. The resulting array can be used as an input for {@link TextToSpeechUtils.autoGenerateSSMLMarks} or {@link TextToSpeechUtils.addMarksToUnmarkedSentences} to update a speech string with the markup required to play random gestures at each unmarked sentence in the string.
   *
   * @param {string[]=} layers - An array of names of managed layers to generate marks for. If undefined, use all managed layers.
   *
   * @returns {string[]}
   */
  createGenericGestureArray(layers?: string[]): string[];

  /**
   * Play a managed gesture animation.
   *
   * @param {string} layerName - The name of the layer that contains the gesture animation.
   * @param {string} animationName - The name of the gesture animation.
   * @param {Object=} options - Optional gesture options.
   * @param {number=} options.holdTime - This option only applies to {@link QueueState} gestures. When a QueueState gesture progresses to a looping state, this option defines how many seconds should elapse before moving the queue forward. If undefined, it will fall back first to the holdTime defined in the options when the gesture animation was registered and then to the holdTime defined on the feature.
   * @param {number=} options.minimumInterval - The minimum amount of time that must have elapsed since the last time a gesture was played.
   * @param {number=} options.transitionTime - Transition Time.
   * @param {boolean=} [options.force=false] - Force.
   */
  playGesture(layerName: string, animationName: string, { holdTime, minimumInterval, transitionTime, force = false }: any = {}): any;

  /**
   * Executes each time the host is updated.
   *
   * @param {number} deltaTime - Amount of time since the last host update was called.
   */
  update(deltaTime: number);

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   */
  installApi();
}
