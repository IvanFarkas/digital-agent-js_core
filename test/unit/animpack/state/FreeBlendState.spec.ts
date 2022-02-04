import {describeHostEnvironment} from '../../EnvironmentHarness';
import {FreeBlendState} from '@core/animpack/state/FreeBlendState';

describeHostEnvironment('FreeBlendState', () => {
  let freeBlendGlobal: FreeBlendState;
  let state1: any;
  let state2: any;
  let state3: any;

  beforeEach(() => {
    state1 = {
      name: 'state1',
      weight: 1,
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
    };
    state1.updateInternalWeight = jest.fn((factor: number) => {
      state1._internalWeight = state1.weight * factor;
    });

    state2 = {
      name: 'state2',
      weight: 0,
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
    };
    state2.updateInternalWeight = jest.fn((factor: number) => {
      state2._internalWeight = state1.weight * factor;
    });

    state3 = {
      name: 'state2',
      weight: 0.5,
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
    };
    state3.updateInternalWeight = jest.fn((factor: number) => {
      state3._internalWeight = state1.weight * factor;
    });

    freeBlendGlobal = new FreeBlendState();
    freeBlendGlobal.addState(state1);
    freeBlendGlobal.addState(state2);
  });

  describe('updateInternalWeight', () => {
    // TODO: Fix
    it.skip('should normalize blend state internal weights when the sum of blend state weights is greater than one', () => {
      const freeBlend = new FreeBlendState({weight: 1});

      freeBlend.addState(state1);
      freeBlend.addState(state2);
      freeBlend.addState(state3);
      state1.weight = 1.0;
      state2.weight = 1.0;
      state3.weight = 0.0;
      freeBlend.updateInternalWeight(1);
      freeBlend._states.forEach((state) => {
        expect(state._internalWeight).toEqual(1 / 2);
      });
      state3.weight = 1.0;
      freeBlend.updateInternalWeight(1);
      freeBlend._states.forEach((state) => {
        expect(state._internalWeight).toEqual(1 / 3);
      });
    });

    // TODO: Fix
    it.skip('should not normalize blend state internal weights when the sum of blend state weights is not greater than one', () => {
      const freeBlend = new FreeBlendState({weight: 1});

      freeBlend.addState(state1);
      freeBlend.addState(state2);
      freeBlend.addState(state3);
      state1.weight = 0.25;
      state2.weight = 0.25;
      state3.weight = 0.25;
      freeBlend.updateInternalWeight(1);
      freeBlend._states.forEach((state) => {
        expect(state._internalWeight).toEqual(1 / 4);
      });
    });

    // TODO: Fix
    it.skip('should update blend state internal weights based on container weight', () => {
      const freeBlend = new FreeBlendState({weight: 1});

      freeBlend.addState(state1);
      freeBlend.addState(state2);
      state1.weight = 1.0;
      state2.weight = 1.0;
      freeBlend.updateInternalWeight(1);
      freeBlend._states.forEach((state) => {
        expect(state._internalWeight).toEqual(0.5);
      });
      freeBlend.weight = 0.5;
      freeBlend.updateInternalWeight(1);
      freeBlend._states.forEach((state) => {
        expect(state._internalWeight).toEqual(0.25);
      });
    });
  });
});
