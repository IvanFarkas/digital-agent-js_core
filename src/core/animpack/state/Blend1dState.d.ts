import {Deferred} from '@core/Deferred';
import {AbstractBlendState} from '@core/animpack/state/AbstractBlendState';
import {AnimationUtils} from '@core/animpack/AnimationUtils';

/**
 * Class for blending N number of blend states based on a single parameter.
 *
 * @extends AbstractBlendState
 *
 * @property {number} _blendValue - Blend Value.
 * @property {any} _promises - Promises. {...this.promises, blendValue: fn}
 * @property {any[]} _thresholds - Threshold values for activating each blend state.
 * @property {boolean} _forceNoThresholdDupes - Force No Threshold Dupes.
 * @property {Function} _phaseLeadState - Phase Lead State.
 */
export declare class Blend1dState extends AbstractBlendState {
  // TODO: Make them private, add getters
  public _blendValue: number;
  public _thresholds: any[];
  public _forceNoThresholdDupes: boolean;
  public _phaseLeadState: any;

  /**
   * @constructor
   *
   * @param {Object} [options] - Options for the container state
   * @param {AbstractBlendState[]} [blendStates=[]] - Blend states to be controlled by this container.
   * @param {number[]} [blendThresholds=[]] - Threshold values for activating each blend state.
   * @param {boolean[]} [phaseMatches=[]] - Booleans indicating whether or not each blend state should be phase matched.
   */
  constructor(options: any = {}, blendStates: IState[] = [], blendThresholds: number[] = [], phaseMatches: boolean[] = []);

  /**
   * Get the blend parameter value.
   *
   * @type {number}
   */
  get blendValue(): number;

  /**
   * Set the blend parameter value.
   *
   * @type {number}
   */
  set blendValue(value: number);

  /**
   * Get whether or not the blend value is currently being animated.
   *
   * @type {any}
   */
  get blendValuePending(): any;

  /**
   * Updates the user defined weight over time.
   *
   * @param {any} name - Unused parameter.
   * @param {number} weight - The target weight value.
   * @param {number} [seconds=0] - The amount of time it will take to reach the target weight.
   * @param {Function=} easingFn - The easing function to use for interpolation.
   *
   * @returns {Deferred}
   */
  setBlendWeight(name: string | null, value: any, seconds: number = 0, easingFn?: any); // : Deferred

  /**
   * Get the user defined weight.
   *
   * @returns {number}
   */
  getBlendWeight(): number;

  /**
   * Add State
   *
   * @param {AbstractBlendState} state - Blend states to be controlled by this container.
   * @param {number} [thresholdValue=0] - The blend threshold of the state.
   * @param {boolean} [phaseMatch=false] - Phase match.
   *
   * @returns {string}
   */
  addState(state: AbstractBlendState, thresholdValue: number = 0, phaseMatch: boolean = false): string;

  /**
   * Remove State
   *
   * @param {string} name - Blend state name.
   *
   * @returns {boolean}
   */
  removeState(name: string): boolean;

  /**
   * Rename State
   *
   * @param {string} currentName - Current Blend state name.
   * @param {string} newName - New Blend state name.
   *
   * @returns {string}
   */
  renameState(currentName: string, newName: string): string;

  /**
   * Get the threshold value of a blend with the corresponding name.
   *
   * @param {string} name - Name of the blend to get the threshold of.
   *
   * @returns {number} Threhold value.
   */
  getBlendThreshold(name: string): number;

  /**
   * Set the threshold value of a blend with the corresponding name.
   *
   * @param {string} name - Name of the blend to set the threshold.
   * @param {number} value - Value of the threshold to set.
   *
   * @returns {number} Set threshold value.
   */
  setBlendThreshold(name: string, value?: number): number;

  /**
   * Multiplies the weight of each sub-state by a factor to determine the internal weight.
   *
   * @private
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);

  /**
   * Updates the blend weights based on their corresponding threshold values and the current blendValue. Additionally, sets a lead phase state if the conditions for phase-matching have been satisfied.
   *
   * @private
   */
  _updateBlendWeights();

  /**
   * Sorts the thresholds from low to high based on value.
   *
   * @private
   */
  _sortThresholds();
}
