import {AbstractBlendState} from '@core/animpack/state/AbstractBlendState';

/**
 * Class for blending N number of blend states.
 *
 * @extends AbstractBlendState
 */
export declare class FreeBlendState extends AbstractBlendState {
  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the container state.
   * @param {AbstractBlendState[]} [blendStates=[]] - Blend states to be controlled by this container.
   */
  constructor(options: any = {}, blendStates: number[] = []);

  /**
   * Multiplies the weight of each sub-state by a factor to determine the internal weight.
   *
   * @private
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor: number);
}
