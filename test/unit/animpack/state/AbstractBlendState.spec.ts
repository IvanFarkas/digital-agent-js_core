// import {describeHostEnvironment} from '@unit/EnvironmentHarness'; // TODO: Use @unit (test/tsconfig.json)
import {describeHostEnvironment} from '../../EnvironmentHarness';
import {Deferred} from '@core/Deferred';
import {AbstractBlendState} from '@core/animpack/state/AbstractBlendState';

describeHostEnvironment('AbstractBlendState', (options: any = {}, env: string) => {
  let blend: AbstractBlendState;
  let state1: any;
  let state2: any;
  let state3: any;

  beforeEach(() => {
    // Note: `jest.fn(implementation)` is a shorthand for `jest.fn().mockImplementation(implementation)`.
    state1 = {
      name: 'state1',
      weight: 1,
      setWeight: jest.fn((weight: number) => new Deferred()).mockName('setWeight'),
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      resume: jest.fn().mockName('resume'),
      cancel: jest.fn().mockName('cancel'),
      stop: jest.fn().mockName('stop'),
      update: jest.fn().mockName('update'),
      discard: jest.fn().mockName('discard'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
      _promises: {weight: new Deferred(), play: new Deferred()},
    };
    state2 = {
      name: 'state2',
      weight: 0,
      setWeight: jest.fn((weight: number) => new Deferred()).mockName('setWeight'),
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      resume: jest.fn().mockName('resume'),
      cancel: jest.fn().mockName('cancel'),
      stop: jest.fn().mockName('stop'),
      update: jest.fn().mockName('update'),
      discard: jest.fn().mockName('discard'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
      _promises: {weight: new Deferred(), play: new Deferred()},
    };
    state3 = {
      name: 'state2',
      weight: 0.5,
      setWeight: jest.fn((weight: number) => new Deferred()).mockName('setWeight'),
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      resume: jest.fn().mockName('resume'),
      cancel: jest.fn().mockName('cancel'),
      stop: jest.fn().mockName('stop'),
      update: jest.fn().mockName('update'),
      discard: jest.fn().mockName('discard'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
      _promises: {weight: new Deferred(), play: new Deferred()},
    };

    state1.setWeight = jest.fn((weight: number) => {
      state1.weight = weight;
    });

    state2.setWeight = jest.fn((weight: number) => {
      state2.weight = weight;
    });

    state3.setWeight = jest.fn((weight: number) => {
      state3.weight = weight;
    });

    blend = new AbstractBlendState({}, [state1, state2]);
  });

  describe('getBlendWeight', () => {
    it('should throw an error when the state is not in the container', () => {
      expect(() => {
        blend.getBlendWeight('NotState');
      }).toThrowError();
    });

    it('should get the weight for the state', () => {
      const weight = 0.52;
      state1.weight = weight;
      expect(blend.getBlendWeight('state1')).toEqual(weight);
    });
  });

  describe('setBlendWeight', () => {
    it('should throw an error when the state is not in the container', () => {
      expect(() => {
        blend.setBlendWeight('NotState', 0);
      }).toThrowError();
    });

    it('should set the state weight to the target weight', async () => {
      const weight = 0.52;

      expect(state1.weight).not.toEqual(weight);

      await blend.setBlendWeight(state1.name, weight);

      expect(state1.weight).toEqual(weight);
    });

    it('should clamp state weights between 0 and 1', async () => {
      await blend.setBlendWeight('state1', -10);

      expect(blend.getBlendWeight('state1')).toEqual(0);

      await blend.setBlendWeight('state1', 10);

      expect(blend.getBlendWeight('state1')).toEqual(1);
    });
  });

  describe('updateInternalWeight', () => {
    it('should call updateInternalWeight on all blend states', () => {
      blend.updateInternalWeight(1);

      blend._states.forEach((state) => {
        expect(state.updateInternalWeight).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('update', () => {
    it('should call update on all blend states', () => {
      blend.update(1);

      blend._states.forEach((state) => {
        expect(state.update).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('play', () => {
    it('should play all blend states', () => {
      blend.play();
      blend._states.forEach((state) => {
        expect(state.play).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('pause', () => {
    it('should pause all blend states', () => {
      blend.pause();
      blend._states.forEach((state) => {
        expect(state.pause).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('resume', () => {
    it('should resume all blend states', () => {
      blend.resume();
      blend._states.forEach((state) => {
        expect(state.resume).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('stop', () => {
    it('should stop all blend states', () => {
      blend.stop();
      blend._states.forEach((state) => {
        expect(state.stop).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('cancel', () => {
    it('should cancel all blend states', () => {
      blend.cancel();
      blend._states.forEach((state) => {
        expect(state.cancel).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('discard', () => {
    it('should discard all blend states', () => {
      const states = blend._states;

      blend.discard();
      states.forEach((state) => {
        expect(state.discard).toHaveBeenCalledTimes(1);
      });
      expect(blend._states.size).toEqual(0);
    });
  });
});
