import { ManagedAnimationLayerInterface } from '@core/animpack/ManagedAnimationLayerInterface';
import { AnimationTypes } from '@core/animpack/AnimationFeature';
import { SSMLSpeechmarkInterface } from '@core/awspack/SSMLSpeechmarkInterface';
import { HostObject } from '@core/HostObject';
import { AbstractHostFeature } from '@core/AbstractHostFeature';
import { Quadratic } from '@core/animpack/Easing';
import { MathUtils } from '@core/MathUtils';
import { Utils } from '@core/Utils';

export interface IAxisMap {
  PositiveX: number[];
  NegativeX: number[];
  PositiveY: number[];
  NegativeY: number[];
  PositiveZ: number[];
  NegativeZ: number[];
}

/**
 * Enum for axis directions.
 *
 * @readonly
 * @enum {Class}
 */
export declare const AxisMap: IAxisMap;

export declare const FaceTargetTypes: {
  EyeCenter: number;
  EyeLeft: number;
  EyeRight: number;
  Mouth: number;
};

/**
 * PointOfInterest controls the gaze direction of the host. Given one or more animations of type Blend2dState, it calculates the angles between the lookTracker object (generally a joint in the host's skeleton) and the lookTarget (the object the host should look at) and drives the managed Blend2dStates' X and Y blend values using the result. You can optionally add saccadic movement to any managed animation to help make the host's eyes appear alive when focused on the same point for exteded periods of time. If blink animations are specified, a blink will be played during large changes in gaze direction.
 *
 * @extends HostFeature
 * @alias core/PointOfInterestFeature
 * @implements SSMLSpeechmarkMixin
 * @implements ManagedAnimationLayer
 *
 * @property {any=} _scene - Engine-specific scene object that contains the host. This object must be defined if using 'setTargetByName' or 'SetTargetById' methods.
 * @property {number[]=} _target - 3D transformation node that the host should try to look at.
 * @property {number[]=} _lookTracker - 3D transformation node that represents the direction the host is currently looking during animation.
 * @property {number[]} _prevTargetPos - Previous Target Pos
 * @property {boolean} _isTargetMoving - Is Target Moving
 * @property {Object=} _lookLayers - Look Layers
 * @property {any[]} _trackingConfigs - Tracking Configs
 * @property {Object=} _blinkLayers - Blink Layers
 * @property {any[]} _managedLayers - Managed Layers
 * @property {Function=} registerLayer - Register Layer
 * @property {any=} microSaccade - Micro movements.
 * @property {any=} macroSaccade - Macro movements.
 * @property {number} h - Movements horizontal.
 * @property {number} v - Movements vertical.
 */
export declare class PointOfInterestFeature extends AbstractHostFeature.mix(SSMLSpeechmarkInterface.Mixin, ManagedAnimationLayerInterface.Mixin) {
  // TODO: Make private, add getters
  private _scene: any;
  public _target: any;
  public _lookTracker: number[];
  public _prevTargetPos: number[];
  public _isTargetMoving: boolean;
  public _lookLayers: any;
  public _trackingConfigs: any[];
  public _blinkLayers: any;
  public microSaccade: any;
  public macroSaccade: any;

  /**
   * @constructor
   *
   * @param {HostObject} host - Host that owns the feature.
   * @param {Object=} options - Options for the feature.
   * @param {Object=} options.target - 3D transformation node that the host should try to look at.
   * @param {Object} options.lookTracker - 3D transformation node that represents the direction the host is currently looking during animation.
   * @param {Object=} options.scene - Engine-specific scene object that contains the host. This object must be defined if using 'setTargetByName' or 'SetTargetById' methods.
   * @param {Object=} lookOptions - Options for the look animation layers.
   * @param {number} [lookOptions.blendTime=0.1] - Default amount of time it will take to manipulate the weights of the look layers.
   * @param {number} [lookOptions.easingFn=Quadratic.InOut] - Default easing function to use when manipulating look layer weights.
   * @param {Array.<Object>} [lookOptions.layers=[]] - An array of layer options objects to register as look layers.
   * @param {Object=} blinkOptions - Options for the blink animation layers.
   * @param {number} [blinkOptions.blendTime=0.075] - Default amount of time it will take to manipulate the weights of the blink layers.
   * @param {number} [blinkOptions.easingFn=Quadratic.InOut] - Default easing function to use when manipulating blink layer weights.
   * @param {Array.<Object>} [blinkOptions.layers=[]] - An array of layer options objects to register as blink layers.
   */
  constructor(host: any, { target, lookTracker, scene }: any = {}, { blendTime: lookBlendTime = 0.1, easingFn: lookEasingFn = Quadratic.InOut, layers: lookLayers = [] }: any = {}, { blendTime: blinkBlendTime = 0.075, easingFn: blinkEasingFn = Quadratic.InOut, layers: blinkLayers = [] }: any = {});

  /**
   * Get the scene.
   *
   * @type {any}
   */
  get scene(): any;

  /**
   * Get the target object the host should look at.
   *
   * @type {any|null}
   */
  get target(): any;

  /**
   * Set the target object the host should look at.
   *
   * @type {any|null}
   */
  set target(target: any);

  /**
   * Return a vector representing the global position of an object. Should be overloaded for each rendering engine implementation.
   *
   * @private
   *
   * @param {any} _obj - Engine-specific 3D transform object.
   *
   * @returns {number[]} - An array consisting of three numbers representing x, y and z coordinates.
   */
  static _getWorldPosition(obj?: any): number[];

  /**
   * Return a matrix representing the global transformation matrix of an object.
   * Should be overloaded for each rendering engine implementation.
   * Identity matrix - https://en.wikipedia.org/wiki/Identity_matrix
   *
   * @private
   *
   * @param {any} obj - Engine-specific 3D transform object.
   *
   * @returns {number[]} - An array consisting of 16 numbers representing the 3d transformation.
   */
  static _getWorldMatrix(obj?: number[]): number[];

  /**
   * Rotate the given local direction vector by the object's world rotation matrix.
   *
   * @private
   *
   * @param {any} obj - Engine-specific 3D transform object.
   * @param {number[]} forwardVector - Unit vector representing the local forward direction of the object.
   *
   * @returns {number[]}
   */
  static _getObjectDirection(obj: number[], forwardVector: number[] = AxisMap.PositiveZ): number[];

  /**
   * Calculate horizontal and vertical look angles in degrees given spherical theta and phi angles in radians.
   *
   * @param {number} theta - Vertical/polar angle in radians where 0 points directly along positive Y axis.
   * @param {number} phi - Horizontal/azimuthal angle in radians.
   *
   * @returns {Object} - An object with the signature {h: number, v: number} where h represents horizontal rotation in degrees and v represents vertical rotation in degrees.
   */
  static _sphericalToBlendValue(theta, phi): { h: number; v: number };

  /**
   * If the added layer is LookLayer, register Look Animation.
   *
   * @private
   *
   * @param {Object} event - Event data passed from the speech.
   * @param {Object} event.name - Look Layer object.
   */
  _onLayerAdded({ name }: { name: string });

  /**
   * If the added layer is LookLayer, register Look Animation.
   *
   * @private
   *
   * @param {Object} event - Event data passed from the speech.
   * @param {Object} event.layerName - Look Layer name.
   * @param {Object} event.animationName - Look Animation name.
   */
  _onAnimationAdded({ layerName, animationName }: { layerName: string; animationName: string });

  /**
   * Ensure that registered look animations are Blend2dStates.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that contains the look animation.
   * @param {string} animationName - Name of the animation.
   */
  _registerLookAnimation(layerName: string, animationName: string);

  /**
   * Check if the given object is not of an engine-specific type. Should be overloaded for each rendering engine implementation.
   *
   * @private
   *
   * @param {any} obj - Object to validate.
   *
   * @returns {boolean}
   */
  static _validateTransformObject(obj: any): boolean;

  /**
   * Check if the given configuration object has already been stored as a tracking config. If it has, return the stored configuration. Otherwise, store and return it.
   *
   * @private
   *
   * @param {Object} config - Object containing tracker, reference and forwardAxis properties.
   *
   * @returns {Object}
   */
  _addTrackingConfig(config: any): any;

  /**
   * Return the distance between the look tracker and the look target.
   *
   * @private
   *
   * @returns {number}
   */
  _getTargetDistance(): number;

  /**
   * Reset all stored tracking angles to 0.
   *
   * @private
   */
  _resetLookAngles();

  /**
   * Store the difference in horizontal and vertical rotation for the tracker's reference rotation and the direction of the target from the tracker.
   *
   * @private
   */
  _setLookAngles();

  /**
   * Return the horizontal and vertical angles it would require to simulate looking at the given type of face target
   *
   * @private
   *
   * @param {number} targetType - Integer representing the FaceTargetType.
   *
   * @returns {Object}- An object with signature {r: number, h: number, v: number} where 'r' represents radius, h represents the horizontal/azimuthal angle and v represents the vertical/polar angle.
   */
  _getFaceTargetAngles(targetType: any): any;

  /**
   * Updated the stored speed and duration variables for a layer based on the change in horizontal and vertical angles of the tracker.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer to store values on.
   * @param {number} h - Change in horizontal angle, in degrees.
   * @param {number} v - Change in vertical angle, in degrees.
   */
  _updateLayerSpeed(layerName: string, h: number, v: number);

  /**
   * Set the microSaccade object with new randomized values.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the saccade motion.
   */
  _setMicroSaccade(layerName: string);

  /**
   * Set the macroSaccade object with new randomized values.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the saccade motion.
   */
  _setMacroSaccade(layerName: string);

  /**
   * Start a new wait timer that will set a new micro saccade movement when it resolves.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the saccade motion.
   * @param {number} minWaitTime - Minimum number of seconds before a new saccade will be triggered.
   * @param {number} maxWaitTime - Maximum number of seconds before a new saccade will be triggered.
   */
  _initializeMicroTimer(layerName: string, minWaitTime?: number, maxWaitTime?: number);

  /**
   * Start a new wait timer that will set a new macro saccade movement when it resolves.
   *
   * @private
   *
   * @param {string} layerName - Name of the layer that owns the saccade motion.
   * @param {number} minWaitTime - Minimum number of seconds before a new saccade will be triggered.
   * @param {number} maxWaitTime - Maximum number of seconds before a new saccade will be triggered.
   */
  _initializeMacroTimer(layerName: string, minWaitTime?: number, maxWaitTime?: number);

  /**
   * Set a new target to look at.
   *
   * @param {Object|null} target - The new target to look at.
   */
  setTarget(target: any);

  /**
   * Finds an object given its name and sets it as the new target to look at. Should be overloaded for each rendering engine implementation.
   *
   * @param {string} name - Name to search for.
   */
  setTargetByName(name: string);

  /**
   * Finds an object given its id and sets it as the new target to look at. Should be overloaded for each rendering engine implementation.
   *
   * @param {string|number} id - Id to search for.
   */
  setTargetById(id: number);

  /**
   * Start keeping track of an animation layer that owns a blend2d animation with blendWeights corresponding to horizontal and vertical look angles.
   *
   * @param {string} layerName - Name of the layer to keep track of.
   * @param {Object=} options - Options for the layer.
   * @param {string} [options.animation = 'look'] - Name of the animation on the layer whose blendWeights will be driven based on the angle between the lookTracker and the lookTarget. This animation must be of type blend2d.
   * @param {number} [options.maxSpeed = 25] - The maximum speed at which the blend2d blendWeights can be manipulated.
   * @param {string} [options.forwardAxis = 'PositiveZ'] - Axis pointing from the front of the lookReference object. Valid options are 'PositiveX', 'NegativeX', 'PositiveY', 'NegativeY', 'PositiveZ', 'NegativeZ'.
   * @param {Object=} options.lookReference - 3D transformation node that the lookTracker rotation limits should be calculated relative to. Defaults to the host owner.
   * @param {number} [options.hasSaccade = false] - Whether or not to include saccadic motion onto the blendWeight animation. This should only be set to true for blend2d animations representing eye animation.
   * @param {number=} [options.blendTime=[PointOfInterestFeature.DEFAULT_LAYER_OPTIONS.blendTime]{@link PointOfInterestFeature#DEFAULT_LAYER_OPTIONS#blendTime}] - Default amount of time to use when manipulating layer weight.
   * @param {Function=} options.easingFn - Default easing function to use when manipulating layer weight.
   */
  registerLookLayer(layerName: string, { animation = 'look', maxSpeed = 25, reference, forwardAxis = 'PositiveZ', hasSaccade = false, blendTime = PointOfInterestFeature.DEFAULT_LAYER_OPTIONS.blendTime, easingFn }: any = {});

  /**
   * Start keeping track of an animation layer that owns a blink animation. Blink animations can be of any type, but if it is of type randomAnimation then a it will be randomized each time a blink is called.
   *
   * @param {string} layerName - Name of the layer to keep track of.
   * @param {Object=} options - Options for the layer.
   * @param {string} [options.animation = 'blink'] - Name of the blink animation on the layer.
   * @param {number} [options.blendTime=[PointOfInterestFeature.DEFAULT_LAYER_OPTIONS.blendTime]{@link PointOfInterestFeature#DEFAULT_LAYER_OPTIONS#blendTime}] - Default amount of time to use when manipulating the layer's weight.
   * @param {Function=} options.easingFn - Default easing function to use when manipulating the layer's weight.
   */
  registerBlinkLayer(layerName: string, { animation = 'blink', blendTime = PointOfInterestFeature.DEFAULT_LAYER_OPTIONS.blendTime, easingFn }: any = {});

  /**
   * Executes each time the host is updated.
   *
   * @param {number} deltaTime - Amount of time since the last host update was called.
   */
  update(deltaTime: number);

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   *
   * @returns {any} API
   */
  installApi(): any;
}
