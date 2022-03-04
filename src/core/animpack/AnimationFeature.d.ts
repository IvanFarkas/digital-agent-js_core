/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import { AbstractHostFeature } from '@core/AbstractHostFeature';
import { Utils } from '@core/Utils';
import { QueueState } from '@core/animpack/state/QueueState';
import { FreeBlendState } from '@core/animpack/state/FreeBlendState';
import { Blend1dState } from '@core/animpack/state/Blend1dState';
import { Blend2dState } from '@core/animpack/state/Blend2dState';
import { SingleState } from '@core/animpack/state/SingleState';
import { RandomAnimationState } from '@core/animpack/state/RandomAnimationState';
import { AnimationLayer, LayerBlendModes } from '@core/animpack/AnimationLayer';
import { Deferred } from '@core/Deferred';
import { HostObject } from '@core/HostObject';
import { stringList } from 'aws-sdk/clients/datapipeline';

// TODO: Fix P2. Convert to Enum.
/**
 * Enum for animation state classes.
 *
 * @readonly
 * @enum {Class}
 */
export const AnimationTypes = {
  single: SingleState,
  freeBlend: FreeBlendState,
  queue: QueueState,
  randomAnimation: RandomAnimationState,
  blend1d: Blend1dState,
  blend2d: Blend2dState,
};

/**
 * Feature for managing animations on an object.
 *
 * @extends HostFeature
 * @alias core/AnimationFeature
 *
 * @property {any[]} _layers - Layers.
 * @property {Object} _layerMap - Layer Map.
 * @property {boolean} _paused - Is paused.
 * @property {Function} emit -  Notify (emmit) callback.
 * @property {Object[]} blendStateOptions - Array of options used to create the blend states for this container.
 * @property {Object[]} queueOptions - Array of options used to create the queue states for this container.
 * @property {number[]} blendThresholds - Array of numbers used to set the thresholds for each blend state in this container.
 * @property {boolean[]} blendMatchPhases - Optional array of booleans used to set whether or not each blend state in this container will match phases.
 * @property {Object[]} subStateOptions - Array of options used to create the sub states for this container.
 * @property {Object} EVENTS - Built-in messages that the feature emits. When the feature is added to a {@link core/HostObject}, event names will be prefixed by the name of the feature class + '.'.
 * @property {string} [EVENTS.addLayer=onAddLayerEvent] - Message that is emitted after [addLayer]{@link core/AnimationFeature#addLayer} has been successfully executed. An object representing the name of the layer that was added and its index in the layer stack with the signature {name: string, index: number} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.removeLayer=onRemoveLayerEvent] - Message that is emitted after [removeLayer]{@link core/AnimationFeature#removeLayer} has been successfully executed. An object representing the name of the layer that was removed and its index in the layer stack with the signature {name: string, index: number} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.renameLayer=onRenameLayerEvent] - Message that is emitted after [renameLayer]{@link core/AnimationFeature#renameLayer} has been successfully executed. An object representing the original name of the layer that was renamed and its updated name with the signature {oldName: string, newName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.addAnimation=onAddAnimationEvent] - Message that is emitted after [addAnimation]{@link core/AnimationFeature#addAnimation} has been successfully executed. An object representing the name of the layer that the animation was added to and the name of the animation that was added with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.removeAnimation=onRemovedAnimationEvent] - Message that is emitted after [removeAnimation]{@link core/AnimationFeature#removeAnimation} has been successfully executed. An object representing the name of the layer that the animation was removed from and the name of the animation that was removed with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.renameAnimation=onRenameAnimationEvent] - Message that is emitted after [renameAnimation]{@link core/AnimationFeature#renameAnimation} has been successfully executed. An object representing the name of the layer that contains the animation that was renamed, the original name of the animation that was renamed and its updated name with the signature {layerName: string, oldName: string, newName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.play=onPlayEvent] - Message that is emitted after each call to [play]{@link core/AnimationFeature#playAnimation}. An object representing the name of the layer contains the animation that was played and the name of the animation that was played with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.pause=onPauseEvent] - Message that is emitted after each call to [pause]{@link core/AnimationFeature#pauseAnimation}. An object representing the name of the layer contains the animation that was paused and the name of the animation that was paused with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.resume=onResumeEvent] - Message that is emitted after each call to [resume]{@link core/AnimationFeature#resumeAnimation}. An object representing the name of the layer contains the animation that was resumed and the name of the animation that was resumed with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.interrupt=onInterruptEvent] - Message that is emitted if there is a current speech in progress and [play]{@link core/AnimationFeature#playAnimation} or [resume]{@link core/AnimationFeature#resumeAnimation} are executed for a new speech. An object representing the name of the layer contains the animation that was interrupted and the name of the animation that was interrupted with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 * @property {string} [EVENTS.stop=onStopEvent] - Message that is emitted after each call to [stop]{@link core/AnimationFeature#stopAnimation} and when a speech reaches the end of playback. An object representing the name of the layer contains the animation that was stopped and the name of the animation that was stopped with the signature {layerName: string, animationName: string} is supplied as an argument to listener functions.
 */
export class AnimationFeature extends AbstractHostFeature {
  // TODO: Fix P2. Make properties starting with '_' private
  private _layers: any;
  private _layerMap: any;
  public _paused: boolean;

  // TODO: Added programatically to class
  // public static EVENTS = {
  //   // TODO: Fix P2. How do I get HostFeatureClass from HostFeatureMixin in a generic way?
  //   // ...Object.getPrototypeOf(HostFeatureClass).EVENTS,
  //   // update: 'onUpdate',

  //   addLayer: 'onAddLayerEvent',
  //   removeLayer: 'onRemoveLayerEvent',
  //   renameLayer: 'onRenameLayerEvent',
  //   addAnimation: 'onAddAnimationEvent',
  //   removeAnimation: 'onRemovedAnimationEvent',
  //   renameAnimation: 'onRenameAnimationEvent',
  //   playAnimation: 'onPlayEvent',
  //   playNextAnimation: 'onNextEvent',
  //   pauseAnimation: 'onPauseEvent',
  //   resumeAnimation: 'onResumeEvent',
  //   interruptAnimation: 'onInterruptEvent',
  //   stopAnimation: 'onStopEvent',
  // };

  /**
   * @constructor
   *
   * @param {HostObject} host - Host object that owns the feature.
   */
  constructor(host: any);

  /**
   * Make sure a supplied layer index is within the range of layers.
   *
   * @private
   *
   * @param {number} index
   * @param {boolean} [existing=true] - Whether the index represents and existing layer or a new layer to be added.
   *
   * @returns {number=}
   */
  _validateIndex(index: number, existing: boolean = true): any; // number | undefined;

  /**
   * Re-evaluate internal weight values of layers starting from the top of the stack.
   * Override layers' weights affect the values of all layers lower in the stack.
   *
   * @private
   */
  _updateInternalWeights();

  /**
   * Return a new instance of a SingleState.
   *
   * @private
   *
   * @param {Object} options - Options to pass to the SingleState constructor.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {weight} [options.weight=0] - The 0-1 amount of influence the state will have.
   * @param {timeScale} [options.timeScale=1] - Factor to scale the playback speed of the animation.
   * @param {number} [options.loopCount=Infinity] - Number of times the animation should repeat before finishing.
   * @param {string} [options.blendMode=LayerBlendModes[DefaultLayerBlendMode]] - Type of blending the animation should use.
   *
   * @returns {SingleState}
   */
  _createSingleState(options: any): SingleState;

  /**
   * Return a new instance of a FreeBlendState.
   *
   * @private
   *
   * @param {Object} options - Options to pass to the FreeBlendState constructor.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {weight} [options.weight=0] - The 0-1 amount of influence the state will have.
   * @param {timeScale} [options.timeScale=1] - Factor to scale the playback speed of the animation.
   * @param {number} [options.loopCount=Infinity] - Number of times the animation should repeat before finishing.
   * @param {string} [options.blendMode=LayerBlendModes[DefaultLayerBlendMode]] - Type of blending the animation should use.
   * @param {Array.<Object>} [options.blendStateOptions] - Array of options used to create the blend states for this container.
   *
   * @returns {FreeBlendState}
   */
  _createFreeBlendState(options: any): FreeBlendState;

  /**
   * Return a new instance of a QueueState.
   *
   * @private
   *
   * @param {Object} options - Options to pass to the QueueState constructor.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {number} [options.weight=0] - The 0-1 amount of influence the state will have.
   * @param {number=} options.transitionTime - The amount of time it takes to transition between queued states.
   * @param {string} [options.blendMode=LayerBlendModes[DefaultLayerBlendMode]] - Type of blending the animation should use.
   * @param {Array.<Object>} [options.queueOptions] - Array of options used to create the queue states for this container.
   *
   * @returns {QueueState}
   */
  _createQueueState(options: any): QueueState;

  /**
   * Return a new instance of a Blend1dState.
   *
   * @private
   *
   * @param {Object} options - Options to pass to the Blend1dState constructor.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {weight} [options.weight=0] - The 0-1 amount of influence the state will have.
   * @param {timeScale} [options.timeScale=1] - Factor to scale the playback speed of the animation.
   * @param {number} [options.loopCount=Infinity] - Number of times the animation should repeat before finishing.
   * @param {string} [options.blendMode=LayerBlendModes[DefaultLayerBlendMode]] - Type of blending the animation should use.
   * @param {Array.<Object>} [options.blendStateOptions] - Array of options used to create the blend states for this container.
   * @param {Array.<number>} [options.blendThresholds] - Array of numbers used to set the thresholds for each blend state in this container.
   * @param {Array.<boolean>} [options.blendMatchPhases=[]] - Optional array of booleans used to set whether or not each blend state in this container will match phases.
   *
   * @returns {Blend1dState}
   */
  _createBlend1dState(options: any): Blend1dState;

  /**
   * Return a new instance of a Blend2dState.
   *
   * @private
   *
   * @param {Object} options - Options to pass to the Blend1dState constructor.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {weight} [options.weight=0] - The 0-1 amount of influence the state will have.
   * @param {timeScale} [options.timeScale=1] - Factor to scale the playback speed of the animation.
   * @param {number} [options.loopCount=Infinity] - Number of times the animation should repeat before finishing.
   * @param {string} [options.blendMode=LayerBlendModes[DefaultLayerBlendMode]] - Type of blending the animation should use.
   * @param {Array.<Object>} [options.blendStateOptions] - Array of options used to create the blend states for this container.
   * @param {Array.<Array.<number>>} [options.blendThresholds] - Array of Array of numbers used to set the thresholds for each blend state in this container.
   * @param {Array.<boolean>} [options.blendMatchPhases=[]] - Optional array of booleans used to set whether or not each blend state in this container will match phases.
   *
   * @returns {Blend1dState}
   */
  _createBlend2dState(options: any): Blend2dState;

  /**
   * Return a new instance of a RandomAnimationState.
   *
   * @private
   *
   * @param {Object} options - Options to pass to the RandomAnimationState constructor.
   * @param {string=} options.name - Name for the animation state. Names must be unique for the layer the state is applied to.
   * @param {number} [options.playInterval=3] - The base animation playback interval.
   * @param {Array.<Object>} [options.subStateOptions] - Array of options used to create the sub states for this container.
   *
   * @returns {RandomAnimationState}
   */
  _createRandomAnimationState(options: any): RandomAnimationState;

  /**
   * Make sure the layer with the given name exists and return a unique version of the animation name supplied for that layer.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer to check against.
   * @param {string} animationName - Name of the animation to validate.
   *
   * @returns {string} Validated animation name.
   */
  _validateNewAnimation(layerName: string, animationName: string): stringList;

  /**
   * Get whether or not all animations are paused.
   *
   * @readonly
   * @type {boolean}
   */
  get paused(): boolean;

  /**
   * Get an array of names of animation layers.
   *
   * @readonly
   * @type {string[]}
   */
  get layers(): string[];

  /**
   * Create and store a new animation layer.
   *
   * @param {string} [name='NewLayer'] - Name for the layer.
   * @param {Object} [options={}] - Options to pass to {@link AnimationLayer#constructor}
   * @param {index=} number - Index to insert the new layer at. If none is provided it will be added to the end of the stack.
   *
   * @returns {number} Index of the new layer.
   */
  addLayer(name: string = 'NewLayer', options: any = {}, index?: number): { name: string; index: any };

  /**
   * Remove an animation layer from the stack. Animations on this layer will no longer be evaluated.
   *
   * @param {string} name - Name for the layer to remove.
   *
   * @returns {boolean} Whether or not removal was successful.
   */
  removeLayer(name: string): boolean;

  /**
   * Re-order the layer stack so that the layer with the given name is positioned at the given index.
   *
   * @param {string} name - Name of the layer to move.
   * @param {number} position - New index to position the layer at.
   *
   * @returns {number} The new index of the layer
   */
  moveLayer(name: string, position: number): number;

  /**
   * Update the name of a layer. Names must be unique, if the new name is not unique it will have trailing numbers appended until it is unique.
   *
   * @param {string} currentName - Current name of the layer.
   * @param {string} newName - New name to set on the layer.
   *
   * @returns {string} The new name of the layer
   */
  renameLayer(currentName: string, newName: string): string;

  /**
   * Return the weight of an animation layer.
   *
   * @param {string} name - Name of the layer to return weight from.
   *
   * @returns {number}
   */
  getLayerWeight(name: string): any; // number | undefined

  /**
   * Update the weight of an animation layer.
   *
   * @param {string} name - The name of the layer to update.
   * @param {number} weight - The weight value to set on the layer. This number should be in the 0-1 range.
   * @param {number=} seconds - The number of seconds it should take to reach the new weight. Default is zero and will set immediately.
   * @param {Function=} easingFn - The easing function to use while interpolating the weight. Default is Easing.Linear.InOut.
   *
   * @returns {Deferred} A promise that will resolve once the layer's weight reaches the target value.
   */
  setLayerWeight(name: string, weight?: number, seconds?: number, easingFn?: any): any; //  Deferred | Promise<never>

  /**
   * Returns the names of blend states in an animation in a layer.
   *
   * @param {string} layerName - Name of the layer containing the animation containing the blend state to update.
   * @param {string} animationName - Name of the animation containing the blend state to update.
   *
   * @returns {string[]} - Names of blend states.
   */
  getAnimationBlendNames(layerName: string, animationName: string): string[];

  /**
   * Update the weight for a blend state in an animation in a layer.
   *
   * @param {string} layerName - Name of the layer containing the animation containing the blend state to update.
   * @param {string} animationName - Name of the animation containing the blend state to update.
   * @param {string} blendName - Name of the blend state to update.
   * @param {number} weight - Weight value to set on the animation. This number shoudld be in the 0-1 range.
   * @param {number=} seconds - Number of seconds it should take to reach the new weight. Default is zero and will set immediately.
   * @param {Function=} easingFn - Easing function to use while interpolating the new weight. Default is Easing.Linear.InOut.
   *
   * @returns {Deferred} - Promise that will resolve once the animation's weight reaches the target value.
   */
  setAnimationBlendWeight(layerName: string, animationName: string, blendName: string, weight: number, seconds?: number, easingFn?: any): any; // : Deferred | Promise<never>
  /**
   * Returns the weight for a blend state in an animation in a layer.
   *
   * @param {string} layerName - Name of the layer containing the animation containing the blend state to update.
   * @param {string} animationName - Name of the animation containing the blend state to update.
   * @param {string} blendName - Name of the blend state to update.
   *
   * @returns {number} - Weight of the blend state.
   */
  getAnimationBlendWeight(layerName: string, animationName: string, blendName: string): number;

  /**
   * Pause weight interpolation animation on a layer with the given name.
   *
   * @param {string} name - Name of the layer to pause.
   *
   * @returns {boolean} - Whether or not there was an existing interpolation to pause.
   */
  pauseLayerWeight(name: string): boolean;

  /**
   * Resume weight interpolation animation on a layer with the given name.
   *
   * @param {string} name - Name of the layer to resume.
   *
   * @returns {Deferred} - Resolves once the layer's weight reaches its target value.
   */
  resumeLayerWeight(name: string): any; //  boolean | Promise<never>;

  /**
   * Pause current animation and weight interpolation animation on a layer with the given name.
   *
   * @param {string} name - Name of the layer to pause.
   *
   * @returns {boolean} - Whether or not there was an existing interpolation or current animation to pause.
   */
  pauseLayer(name: string): boolean;

  /**
   * Resume current animation and weight interpolation animation on a layer with the given name.
   *
   * @param {string} name - Name of the layer to resume.
   *
   * @returns {Deferred} - Resolves once the layer's weight reaches its target value and it's current animation finishes playing.
   */
  resumeLayer(name: string): any; //  boolean | Promise<never>;

  /**
   * Return whether or not the animation layer with the given name is currently transitioning between animations.
   *
   * @param {string} layerName - Name of the layer to check.
   *
   * @returns {boolean}
   */
  getTransitioning(layerName: string): boolean;

  /**
   * Return an array of the names of all states the layer with the given name controls.
   *
   * @param {string} layerName - Name of the layer to search.
   *
   * @returns {string[]}
   */
  getAnimations(layerName: string): string[];

  /**
   * Return the name of the state currently active on the layer with the given name. Return null if there is no current animation for the layer.
   *
   * @param {string} layerName - Name of the layer.
   *
   * @returns {(string|null)}
   */
  getCurrentAnimation(layerName: string): any; //  string | null

  /**
   * Return whether or not a layer with the given name is currently playing an animation and that animation is paused.
   *
   * @param {string} layerName - Name of the layer.
   *
   * @returns {boolean}
   */
  getPaused(layerName: string): boolean;

  /**
   * Return the type name of the given animation. @see AnimationTypes.
   *
   * @param {string} layerName - Name of the layer that contains the animation.
   * @param {string} animationName - Name of the animation to check.
   *
   * @returns {string}
   */
  getAnimationType(layerName: string, animationName: string): any; //  string | undefined

  /**
   * Add a new animation to an animation layer.
   *
   * @param {string} layerName - Name of the layer to add the animation to.
   * @param {string} animationName - Name to use when calling the animation.
   * @param {Object=} options - Options to pass to the constructor for the new SingleState animation.
   *
   * @returns {string} - The name of the animation that was added
   */
  addAnimation(layerName: string, animationName: string, animationType: any = AnimationTypes.single, options: any = {}): boolean;

  /**
   * Remove an animation from an animation layer.
   *
   * @param {string} layerName - Name of the layer to remove the animation from.
   * @param {string} name - Name of the animation to remove.
   *
   * @returns {boolean}
   */
  removeAnimation(layerName: string, animationName?: any): boolean;

  /**
   * Update the name of an animation. Names must be unique on each layer, if the new name is not unique it will have trailing numbers appended until it is unique.
   *
   * @param {string} layerName - Name of the layer that contains the animation that will be renamed,
   * @param {string} currentAnimationName - Current name of the animation.
   * @param {string} newAnimationName - New name to set on the animation.
   *
   * @returns {string} - The new name of the animation
   */
  renameAnimation(layerName: string, currentAnimationName: string, newAnimationName: string): string;

  /**
   * Pause the currently playing animation and play a new animation from the beginning.
   *
   * @param {string} layerName - Name of the layer that contains the animation.
   * @param {string} animationName - Name of the animation state to play.
   * @param {number=} seconds - The number of seconds it should take to transition to the new animation. Default is zero and will set immediately.
   * @param {Function=} easingFn - The easing function to use while transitioning between animations. Default is Easing.Linear.InOut.
   *
   * @returns {Deferred} - Resolves once the animation reaches the end of its timeline. Looping animations can only resolve if they are interrupted or manually stopped.
   */
  playAnimation(layerName: string, animationName: string, seconds?: number, easingFn?: any): any; // Deferred | Promise<never>

  /**
   * Play the next animation in the queue of a QueueState animation.
   *
   * @param {string} layerName - Name of the layer that contains the queue animation.
   * @param {string=} animationName - Name of the animation queue animation. Defaults to the name of the current animation for the layer.
   * @param {number=} seconds - The number of seconds it should take to transition to the queue animation if it's not already currently playing. Default is zero and will set immediately.
   * @param {Function=} easingFn - The easing function to use while transitioning to the queue animation if it isn't already playing. Default is Easing.Linear.InOut.
   *
   * @returns {Deferred} - Resolves once the last animation in the queue finishes playing.
   */
  playNextAnimation(layerName: string, animationName: string, transitionTime?: any, easingFn?: any): any; // Deferred | Promise<never>

  /**
   * Pause the current animation on a layer.
   *
   * @param {string} name - Name of the layer to pause.
   *
   * @returns {boolean} Whether or not an animation was successfully paused.
   */
  pauseAnimation(name: string): boolean;

  /**
   * Pause the currently playing animation and play a new animation from where it last left off.
   *
   * @param {string} layerName - Name of the layer that contains the animation.
   * @param {string=} animationName - Name of the animation state to resume. Defaults to the name of the current animation for the layer.
   * @param {number=} seconds - The number of seconds it should take to transition to the new animation. Default is zero and will set immediately.
   * @param {Function=} easingFn - The easing function to use while transitioning between animations. Default is Easing.Linear.InOut.
   *
   * @returns {Deferred} - Resolves once the animation reaches the end of its timeline. Looping animations can only resolve if they are interrupted or manually stopped.
   */
  resumeAnimation(layerName: string, animationName: string, seconds?: number, easingFn?: any): any; // Deferred | Promise<never>

  /**
   * Stop the current animation on a layer. Stop rewinds the animation to the beginning and prevents it from progressing forward.
   *
   * @param {string} name - Name of the layer that contains the animation.
   *
   * @returns {boolean} Whether or not an animation was successfully stopped.
   */
  stopAnimation(name: string): boolean {
    const { item } = this._layerList.get(name);
    const layer = item;

    if (layer === undefined || layer === null) {
      console.warn(`Did not stop animation on layer ${name} for host ${this.host.id}. No layer exists with this name.`);
      return false;
    }

    return layer.stopAnimation();
  }

  /**
   * Pause current animation and weight interpolation animation on all layers.
   *
   * @returns {boolean} - Whether or not there was an existing interpolation or current animations to pause.
   */
  pause(): boolean;

  /**
   * Resume current animation and weight interpolation animation on all layers.
   *
   * @returns {boolean} - Whether or not there was an existing interpolation or current animations to resume.
   */
  resume(): boolean;

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   *
   * @see AnimationFeature
   */
  installApi();

  /**
   * Update each animation layer.
   *
   * @param {number} deltaTime - Time since the last update.
   */
  update(deltaTime: number);

  /**
   * discard each animation layer.
   */
  discard();
}
