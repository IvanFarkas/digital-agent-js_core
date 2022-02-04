import {describeHostEnvironment} from '../../EnvironmentHarness';
import {RandomAnimationState} from '@core/animpack/state/RandomAnimationState';
import {Deferred} from '@core/Deferred';
import {Utils} from '@core/Utils';

describeHostEnvironment('RandomAnimationState', (options: any = {}, env: string) => {
  let randomAnimStateGlobal: RandomAnimationState;
  let state1: any;
  let state2: any;
  let state3: any;

  beforeEach(() => {
    state1 = {
      name: 'state1',
      weight: 1,
      setWeight: jest.fn(() => new Deferred()).mockName('setWeight'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
      internalWeight: jest.fn().mockName('internalWeight'),
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      resume: jest.fn().mockName('resume'),
      cancel: jest.fn().mockName('cancel'),
      stop: jest.fn().mockName('stop'),
      update: jest.fn().mockName('update'),
      discard: jest.fn().mockName('discard'),
      deactivate: jest.fn().mockName('deactivate'),
      _promises: {weight: new Deferred(), play: new Deferred()},
    };
    state1.updateInternalWeight((factor: number) => {
      state1._internalWeight = state1.weight * factor;
    });
    state1.setWeight((weight: number) => {
      state1.weight = weight;
    });

    state2 = {
      name: 'state2',
      weight: 0,
      setWeight: jest.fn(() => new Deferred()).mockName('setWeight'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
      internalWeight: jest.fn().mockName('internalWeight'),
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      resume: jest.fn().mockName('resume'),
      cancel: jest.fn().mockName('cancel'),
      stop: jest.fn().mockName('stop'),
      update: jest.fn().mockName('update'),
      discard: jest.fn().mockName('discard'),
      deactivate: jest.fn().mockName('deactivate'),
      _promises: {weight: new Deferred(), play: new Deferred()},
    };
    state2.updateInternalWeight((factor: number) => {
      state2._internalWeight = state1.weight * factor;
    });
    state2.setWeight((weight: number) => {
      state2.weight = weight;
    });

    state3 = {
      name: 'state2',
      weight: 0.5,
      setWeight: jest.fn(() => new Deferred()).mockName('setWeight'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
      internalWeight: jest.fn().mockName('internalWeight'),
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      resume: jest.fn().mockName('resume'),
      cancel: jest.fn().mockName('cancel'),
      stop: jest.fn().mockName('stop'),
      update: jest.fn().mockName('update'),
      discard: jest.fn().mockName('discard'),
      deactivate: jest.fn().mockName('deactivate'),
      _promises: {weight: new Deferred(), play: new Deferred()},
    };
    state3.updateInternalWeight((factor: number) => {
      state3._internalWeight = state1.weight * factor;
    });
    state3.setWeight((weight: number) => {
      state3.weight = weight;
    });
    jest.spyOn(Utils, 'getRandomInt').mockReturnValue(0);

    randomAnimStateGlobal = new RandomAnimationState();
    randomAnimStateGlobal.addState(state1);
    randomAnimStateGlobal.addState(state2);
  });

  describe('_resetTimer', () => {
    it('should reset play timer using Utils function', () => {
      jest.spyOn(Utils, 'getRandomFloat').mockReturnValue(0.5);
      randomAnimStateGlobal._resetTimer();

      expect(Utils.getRandomFloat).toHaveBeenCalledWith(randomAnimStateGlobal._playInterval / 4, randomAnimStateGlobal._playInterval * 2);
      expect(randomAnimStateGlobal._promises.timer).toBeInstanceOf(Deferred);
    });
  });

  // TODO: Fix
  describe('updateInternalWeight', () => {
    it.skip('should update currentState internal weight internal weight of this state', () => {
      const randomAnimState = new RandomAnimationState({weight: 1});

      randomAnimState.addState(state1);
      randomAnimState.addState(state2);
      state1.weight = 1.0;
      state2.weight = 1.0;
      randomAnimState._currentState = state1;
      randomAnimState.updateInternalWeight(1 / 2);

      expect(state1._internalWeight).toEqual(1 / 2);
      expect(state2._internalWeight).toBeUndefined();
    });
  });

  describe('playRandomAnimation', () => {
    it('should prepare and call state1 play function', () => {
      randomAnimStateGlobal.playRandomAnimation();

      expect(Utils.getRandomInt).toHaveBeenCalledWith(0, 2);
      expect(state1.play).toHaveBeenCalledTimes(1);
    });
  });

  describe('play', () => {
    it('should call state1 play function', () => {
      randomAnimStateGlobal.play();

      expect(state1.play).toHaveBeenCalledTimes(1);
    });
  });

  describe('pause', () => {
    it('should call state1 pause function', () => {
      randomAnimStateGlobal.play();
      randomAnimStateGlobal.pause();

      expect(state1.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe('resume', () => {
    it('should call state1 resume function', () => {
      randomAnimStateGlobal.play();
      randomAnimStateGlobal.resume();

      expect(state1.resume).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should call stopAnimation function', () => {
      randomAnimStateGlobal.stopAnimation = jest.fn().mockName('stopAnimation');
      randomAnimStateGlobal.play();
      randomAnimStateGlobal.stop();

      expect(randomAnimStateGlobal.stopAnimation).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('should call state 1 cancel function', () => {
      randomAnimStateGlobal.play();
      randomAnimStateGlobal.cancel();

      expect(state1.cancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('discard', () => {
    it('should execute discard on all stored states', () => {
      const states = [...randomAnimStateGlobal._states.values()];

      randomAnimStateGlobal.discard();

      states.forEach((state) => {
        expect(state.discard).toHaveBeenCalledTimes(1);
      });
    });

    it('should remove all references to states', () => {
      const emptyStates = new Map<string, any>().clear();

      expect(randomAnimStateGlobal._states).toBeDefined();

      randomAnimStateGlobal.discard();

      expect(randomAnimStateGlobal._states.size).toEqual(0);
    });
  });
});
