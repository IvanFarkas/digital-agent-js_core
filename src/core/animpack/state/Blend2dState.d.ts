import {Vector2, Vector3, MathUtils as math} from 'three';
import {Deferred} from '@core/Deferred';
import {MathUtils, getVector3Array} from '@core/MathUtils';
import {AbstractBlendState, IState} from '@core/animpack/state/AbstractBlendState';
import {AnimationUtils} from '@core/animpack/AnimationUtils';

/**
 * Class for blending N number of blend states based on two paramters.
 *
 * @extends AbstractBlendState
 *
 * @property {number} _blendValueX - Blend Value X.
 * @property {number} _blendValueY - Blend Value Y.
 * @property {any} _thresholds - Thresholds for activating each blend state. {name: string, phaseMatch: boolean,}[]
 * @property {number[][]} _vertices - Vertices.
 * @property {number[][]} _triangles - Triangles. {indices: number[][]; edges: number[][][];}[]
 * @property {Function} _phaseLeadState - Phase Lead State fn.
 */
export class Blend2dState extends AbstractBlendState {
  // TODO: Make them private, add getters
  public _blendValueX: number;
  public _blendValueY: number;
  public _thresholds: any;
  public _vertices: number[][];
  public _triangles: number[][];
  public _phaseLeadState: any;

  /**
   * @constructor
   *
   * @param {Object} [options] - Options for the container state
   * @param {AbstractBlendState[]} [blendStates=[]] - Blend states to be controlled by this container.
   * @param {number[][]} [blendThresholds=[]] - Threshold values for activating each blend state.
   * @param {boolean[]} [phaseMatches=[]] - Booleans indicating whether or not each blend state should be phase matched.
   */
  constructor(options: any = {}, blendStates: IState[] = [], blendThresholds: number[][] = [], phaseMatches: boolean[] = []);

  /**
   * Updates the user defined weight over time.
   *
   * @param {string} name - Name of blend weight to update.
   * @param {number} weight - Target weight value.
   * @param {number} [seconds=0] - The amount of time it will take to reach the target value.
   * @param {Function=} easingFn - The easing function to use for interpolation.
   *
   * @returns {Deferred}
   */
  setBlendWeight(name: string, value: any, seconds: number = 0, easingFn?: any); // : Deferred

  /**
   * Get the user defined weight.
   *
   * @param {string} name - Name of blend weight.
   *
   * @returns {number}
   */
  getBlendWeight(name: string): number;

  /**
   * Get the x blend weight.
   *
   * @type {number}
   */
  get blendValueX(): number;

  /**
   * Set the x blend weight.
   *
   * @type {number}
   */
  set blendValueX(value: number);

  /**
   * Get the y blend weight.
   *
   * @type {number}
   */
  get blendValueY(): number;

  /**
   * Set the y blend weight.
   *
   * @type {number}
   */
  set blendValueY(value: number);

  /**
   * Get whether or not the x blend value is currently being animated.
   *
   * @type {number}
   */
  get blendValueXPending(): number;

  /**
   * Get whether or not the y blend value is currently being animated.
   *
   * @type {number}
   */
  get blendValueYPending(): number;

  /**
   * Multiplies the weight of each sub-state by a factor to determine the internal weight.
   *
   * @private
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);

  /**
   * Updates the blend weights based on their corresponding threshold values and the current [x,y] blendValue. Additionally, sets a lead phase state if the conditions for phase-matching have been satisfied.
   *
   * @private
   */
  _updateBlendWeights();

  /**
   * Set blend weights for states corresponding to a triangle of thresholds and a given [x,y] blendValues.
   *
   * @param {number[][]} triangle - Set of triangluated indices that correspond to blend thresholds.
   * @param {number[]} p - Given [x,y] blendValue.
   *
   * @private
   */
  _setInfluenceTriangle(triangle: number[][], p: number[]);
  // _setInfluenceTriangle(triangle: Vector3, p: Vector2);

  /**
   * Determines the closest point within a triangle of thresholds based on the current [x,y] blendValues and then sets blend weights for the corresponding states.
   *
   * @param {number[]} p - Given [x,y] blendValue.
   *
   * @private
   */
  _setInfluenceClosestPointInTriangles(p: number[]);

  /**
   * Determines the closest point on the line formed between the two blend thresholds based on the current [x,y] blendValues and then sets blend weights for the corresponding states.
   *
   * @param {number[]} p - Given [x,y] blendValue.
   *
   * @private
   */
  _setInfluenceClosestPointOnLine(p: number[]);

  /**
   * Set a lead phase state if the conditions for phase-matching are satisfied.
   *
   * @param {AbstractBlendState[]} states - States to check phase-matching criteria.
   * @param {boolean[]} phaseMatched - List of phase-match booleans.
   *
   * @private
   */
  _setPhaseLeadState(states: AbstractBlendState[], phaseMatched: boolean[]) {
    let max = 0;
    states.forEach((state: any, index: number) => {
      if (phaseMatched[index] && state.weight > max) {
        this._phaseLeadState = state;
        max = state.weight;
      }
    });
  }
}
