import { HostObject } from 'core/HostObject';
import { MathUtils } from 'core/MathUtils';
import { Quadratic } from 'core/animpack/Easing';
import { ManagedAnimationLayerInterface } from 'core/animpack/ManagedAnimationLayerInterface';
import { TextToSpeechFeatureDependentInterface } from 'core/awspack/TextToSpeechFeatureDependentInterface';
import { AbstractHostFeature } from 'core/AbstractHostFeature';

/**
 * Default mapping of Polly viseme names to animation options objects.
 *
 * @property {Object} [sil={name: 'sil'}]
 * @property {Object} [p={name: 'p', overrideWeight: 0.9}]
 * @property {Object} [t={name: 't', blendTime: 0.2}]
 * @property {Object} [S={name: 'S'}]
 * @property {Object} [T={name: 'T'}]
 * @property {Object} [f={name: 'f', overrideWeight: 0.75}]
 * @property {Object} [k={name: 'k'}]
 * @property {Object} [i={name: 'i'}]
 * @property {Object} [r={name: 'r'}]
 * @property {Object} [s={name: 's', blendTime: 0.25}]
 * @property {Object} [u={name: 'u'}]
 * @property {Object} [@={name: '@'}]
 * @property {Object} [a={name: 'a'}]
 * @property {Object} [e={name: 'e', blendTime: 0.2}]
 * @property {Object} [E={name: 'E'}]
 * @property {Object} [o={name: 'o'}]
 * @property {Object} [O={name: 'O'}]
 */
export const DefaultVisemeMap: {
  sil: { name: string };
  p: { name: string; overrideWeight: number };
  t: { name: string; blendTime: number };
  S: { name: string };
  T: { name: string };
  f: { name: string; overrideWeight: number };
  k: { name: string };
  i: { name: string };
  r: { name: string };
  s: { name: string; blendTime: number };
  u: { name: string };
  '@': { name: string };
  a: { name: string };
  e: { name: string; blendTime: number };
  E: { name: string };
  o: { name: string };
  O: { name: string };
};

/**
 * Lipsync controls two types of movement: idle animation that should play while speech is playing and viseme animations corresponding to Polly visemes whose weights should be turned on and off as they are encountered in the Polly SSML transcript. Layers owned by this feature will be enabled while speech is playing and disabled once it stops.
 *
 * @extends HostFeature
 * @alias core/LipsyncFeature
 * @implements TextToSpeechFeatureDependentMixin
 * @implements ManagedAnimationLayerMixin
 *
 * @property {Object} _visemeLayers - Viseme Layers
 * @property {Object} _talkingLayers - Talking Layers
 * @property {any} _visemeLeadTime - The amount of time to instruct the TextToSpeechFeature to emit speechmarks before each one's actual timestamp is reached. This will set the 'speechMarkOffset' variable on the TextToSpeechFeature.
 */
export class LipsyncFeature extends AbstractHostFeature.mix(TextToSpeechFeatureDependentInterface.Mixin, ManagedAnimationLayerInterface.Mixin) {
  // TODO: Make private, add getters
  public _visemeLayers: any;
  public _talkingLayers: any;
  public _visemeLeadTime: any;

  /**
   * @constructor
   *
   * @param {HostObject} host - Host that owns the feature.
   * @param {Object=} visemeOptions - Options for the viseme layers.
   * @param {number} [visemeOptions.blendTime=0.15] - Default amount of time it will take to manipulate each freeBlend weight on the viseme states.
   * @param {Object} [visemeOptions.decayRate={amount:0.5, seconds:0.5}] - An object describing the 0-1 factor viseme weight will decay if the viseme duration is longer than the blendTime and the number of seconds it would take to decay by that factor.
   * @param {number} [visemeOptions.easingFn=Quadratic.InOut] - Default easing function to use when manipulating viseme freeBlend weights.
   * @param {any} [visemeOptions.layers=[]] - An array of layer options objects to register as viseme layers.
   * @param {Object=} talkingOptions - Options for the talking layers.
   * @param {number} [talkingOptions.blendTime=0.75] - Default amount of time to enable and disable the talking idle layers
   * @param {number} [talkingOptions.easingFn=Quadratic.InOut] - Default easing function to use when manipulating weights on the talking idle layers.
   * @param {any} [talkingOptions.layers=[]] - An array of layer options objects to register as talking layers.
   * @param {number} [visemeLeadTime=.067] - The amount of time to instruct the TextToSpeechFeature to emit speechmarks before each one's actual timestamp is reached. This will set the 'speechMarkOffset' variable on the TextToSpeechFeature.
   */
  // TODO: Validate. Refactor for TS best practices
  constructor(host: any, /* visemeOptions= */ { blendTime: visemeBlendTime = 0.15, decayRate: { amount = 0.5, seconds = 0.5 } = {}, easingFn: visemeEasingFn = Quadratic.InOut, layers: visemeLayers = [] }: any = {}, /* talkingOptions= */ { blendTime: talkingBlendTime = 0.75, easingFn: talkingEasingFn = Quadratic.InOut, layers: talkingLayers = [] }: any = {}, visemeLeadTime: number = 0.067);

  /**
   * Ensure that registered viseme animations are FreeBlendStates.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that contains the viseme animation.
   * @param {string} animationName - Name of the animation.
   */
  _registerVisemeAnimation(layerName: string, animationName: string);

  /**
   * If the added feature is TextToSpeech, update its speechMarkOffset variable.
   *
   * @private
   *
   * @param {string} typeName - Name of the type of feature that was added.
   */
  _onFeatureAdded(typeName: string);

  /**
   * If the added layer is TextToSpeech, register Viseme Animation.
   *
   * @private
   *
   * @param {Object} event - Event data passed from the speech.
   * @param {Object} event.name - Viseme Layer object.
   */
  _onLayerAdded({ name }: { name: any });

  /**
   * If the added Animation is TextToSpeech, register Viseme Animation.
   *
   * @private
   *
   * @param {Object} event - Event data passed from the speech.
   * @param {Object} event.layerName - Viseme Layer object.
   * @param {Object} event.animationName - Viseme Layer object.
   */
  _onAnimationAdded({ layerName, animationName }: { layerName: any; animationName: any });

  /**
   * On Play.
   *
   * @private
   */
  _onPlay();

  /**
   * On Pause.
   *
   * @private
   */
  _onPause();

  /**
   * On Resume.
   *
   * @private
   */
  _onResume();

  /**
   * On Stop.
   *
   * @private
   */
  _onStop();

  /**
   * When viseme events are caught, turn on weight of the new viseme for the duration of the speech mark, then turn weight back off.
   *
   * @private
   *
   * @param {Object} event - Event data passed from the speech.
   * @param {Object} event.mark - Speechmark object.
   */
  async _onViseme({ mark }: { mark: any } = { mark: {} });

  /**
   * Animate a viseme blend weight towards a value and then back to zero.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that contains the viseme.
   * @param {string} animName - Name of the freeblend animation that contains the viseme.
   * @param {string} visemeName - Name of the blend weight to manipulate.
   * @param {number} weight - Peak weight to animate towards.
   * @param {number} blendInTime - Amount of time it should take to reach the peak weight.
   * @param {number} blendOutTime - Amount of time it should take to animate back to zero after reaching the peak weight.
   * @param {Function} easingFn - Easing function to use during animation.
   */
  _animateSimpleViseme(layerName: string, animName: string, visemeName: string, peakWeight: any, blendInTime?: number, blendOutTime?: number, easingFn?: any);

  /**
   * Animate a viseme blend weight towards a value and then back to zero.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that contains the viseme.
   * @param {string} animName - Name of the freeblend animation that contains the viseme.
   * @param {string} visemeName - Name of the blend weight to manipulate.
   * @param {number} peakWeight - Peak weight to animate towards.
   * @param {number} decayWeight - Weight to animate towards after reaching the peak weight.
   * @param {number} blendInTime - Amount of time it should take to reach the peak weight.
   * @param {number} holdTime - Amount of time it should take to reach the decay weight after the peak weight has been reached.
   * @param {number} blendOutTime - Amount of time it should take to animate back to zero after reaching the decay weight.
   * @param {Function} easingFn - Easing function to use during animation.
   */
  async _animateHeldViseme(layerName: string, animName: string, visemeName: string, peakWeight: number, decayWeight: number, blendInTime?: number, holdTime?: number, blendOutTime?: number, easingFn?: any): any; // Promise<void>;

  /**
   * Get the amount of time in seconds to negatively offset speechmark emission by.
   *
   * @type {number}
   */
  get visemeLeadTime(): number;

  /**
   * Set the amount of time in seconds to negatively offset speechmark emission by.
   *
   * @type {number}
   */
  set visemeLeadTime(seconds: number);

  /**
   * Start keeping track of an animation layer that owns a freeBlend animation with blendWeights corresponding to visemes.
   *
   * @param {string} layerName - Name of the layer to keep track of.
   * @param {Object=} options - Options for the layer.
   * @param {string} [options.animation='visemes'] - Name of the animation on the layer that will be played during speech. This animation must be of type freeBlend.
   * @param {Object=} decayRate
   * @param {number} [decayRate.amount=0.5] - The percentage to decrease the viseme's peak value by over time once the peak value has been reached.
   * @param {number} [decayRate.seconds=0.5] - The amount of time in seconds to decrease the viseme's weight once it has reached its peak value.
   * @param {number=} [options.blendTime=[LipsyncFeature.DEFAULT_LAYER_OPTIONS.blendTime]{@link LipsyncFeature#DEFAULT_LAYER_OPTIONS#blendTime}] - Default amount of time to use when manipulating animation blendWeights.
   * @param {Function=} options.easingFn - Default easing function to use when manipulating animation blendWeights.
   * @param {Object} [options.visemeMap=DefaultVisemeMap] - Object containing key/value pairs of Polly viseme names mapped to objects containing the name of the corresponding animation blendWeight and any other animation options to use such as viseme specific blend times and easing functions.
   */
  registerVisemeLayer(layerName: string, { animation = 'visemes', decayRate = { amount: 0.5, seconds: 0.5 }, blendTime = LipsyncFeature.DEFAULT_LAYER_OPTIONS.blendTime, easingFn, visemeMap = DefaultVisemeMap }: any = {});

  /**
   * Start keeping track of an animation layer that contains a looping animation to be played during speech.
   *
   * @param {string} layerName - Name of the layer to keep track of.
   * @param {Object=} options - Options for the layer.
   * @param {string} [options.animation='stand_talk'] - Name of the animation on the layer that will be played during speech.
   * @param {number} [options.blendTime=[LipsyncFeature.DEFAULT_LAYER_OPTIONS.blendTime]{@link LipsyncFeature#DEFAULT_LAYER_OPTIONS#blendTime}] - Default amount of time to use when manipulating the layer's weights.
   * @param {Function=} options.easingFn - Default easing function to use when manipulating the layer's weights.
   */
  registerTalkingLayer(layerName: string, { animation = 'stand_talk', blendTime = LipsyncFeature.DEFAULT_LAYER_OPTIONS.blendTime, easingFn }: any = {});

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   *
   * @see LipsyncFeature
   * @returns {any} API
   */
  installApi(): any;
}
