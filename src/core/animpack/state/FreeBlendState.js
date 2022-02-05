import { AbstractBlendState } from '../../../core/animpack/state/AbstractBlendState';

/**
 * Class for blending N number of blend states.
 *
 * @extends AbstractBlendState
 */
export class FreeBlendState extends AbstractBlendState {
  /**
   * @constructor
   *
   * @param {Object} [options={}] - Options for the container state.
   * @param {number[]} [blendStates=[]] - Blend states to be controlled by this container.
   */
  constructor(options = {}, blendStates = []) {
    super(options, blendStates);
  }

  /**
   * Multiplies the weight of each sub-state by a factor to determine the internal weight.
   *
   * @private
   * @param {number} factor - 0-1 multiplier to apply to the user weight.
   */
  updateInternalWeight(factor) {
    super.updateInternalWeight(factor);

    // Determine the total active weight of blend states
    let sumWeights = 0;

    this._states.forEach((state) => {
      sumWeights += state.weight;
    });

    // Ensure the sum of blend state internal weights does not exceed container internal weight
    factor /= Math.max(sumWeights, 1);

    // Sum of blend state internal weights should not exceed container internal weight
    this._states.forEach((state) => {
      state.updateInternalWeight(factor * this._weight);
    });
  }
}
