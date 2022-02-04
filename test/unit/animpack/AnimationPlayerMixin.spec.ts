import {Deferred} from '@core/Deferred';
import {AnimationPlayerMixin} from '@core/animpack/AnimationPlayerMixin';
import {MixinBase} from '@core/MixinBase';

describe('AnimationPlayerMixin', () => {
  let player: PlayerClass;
  let state1: any;
  let state2: any;
  let state3: any;

  class PlayerClass extends AnimationPlayerMixin(MixinBase) {}

  beforeEach(() => {
    state1 = {
      name: 'state1',
      weight: 1,
      setWeight: jest.fn().mockName('setWeight'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
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
    state1.setWeight = jest.fn(() => new Deferred());

    state2 = {
      name: 'state2',
      weight: 0,
      setWeight: jest.fn().mockName('setWeight'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
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
    state2.setWeight = jest.fn(() => new Deferred());

    state3 = {
      name: 'state2',
      weight: 0.5,
      setWeight: jest.fn().mockName('setWeight'),
      updateInternalWeight: jest.fn().mockName('updateInternalWeight'),
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
    state3.setWeight = jest.fn(() => new Deferred());

    player = new PlayerClass();
    // @ts-ignore
    player._states.set('state1', state1);
    // @ts-ignore
    player._states.set('state2', state2);
    player._currentState = state1;
  });

  describe('paused', () => {
    it('should return a boolean', () => {
      expect(typeof player.paused).toEqual('boolean');
    });
  });

  describe('_prepareCurrentState', () => {
    it('should execute onError argument and throw an error if no state exists on the player with the given name', () => {
      const onError = jest.fn().mockName('onError');
      try {
        player._prepareCurrentState('state5', 'play', 0, undefined, onError);
      } catch (e) {}

      expect(onError).toHaveBeenCalledTimes(1);
      expect(player._prepareCurrentState.bind(player, 'state5', 'play')).toThrowError();
    });

    it('should set _currentState to the targetState if transition time is less than or equal to 0', () => {
      expect(player._currentState).not.toEqual(state2);

      player._prepareCurrentState('state2', 'play', 0);

      expect(player._currentState).toEqual(state2);
    });

    it("should force the previous _currentState's weight to 0 if transition time is less than or equal to 0", () => {
      expect(state1.weight).toEqual(1);

      player._prepareCurrentState('state2', 'play', 0);

      expect(state1.weight).toEqual(0);
    });

    it('should set the _currentState to _transitionState if transition time is greater than zero', () => {
      expect(player._currentState).not.toEqual(player._transitionState);

      player._prepareCurrentState('state2', 'play', 1);

      expect(player._currentState).toEqual(player._transitionState);
    });

    it("should force the new _currentState's weight to 1", () => {
      expect(state2.weight).toEqual(0);

      player._prepareCurrentState('state2', 'play', 0);

      expect(state2.weight).toEqual(1);

      expect(player._transitionState.weight).toEqual(0);

      player._prepareCurrentState('state1', 'play', 1);

      expect(player._transitionState.weight).toEqual(1);
    });

    it('should configure the transition state with currentStates set to an array of states with non-zero or pending weights', () => {
      state3.name = 'state3';
      // @ts-ignore
      player._states.set('state3', state3);
      player._prepareCurrentState('state2', 'play', 1);

      expect(player._transitionState._from).toContain(state1);
      expect(player._transitionState._from).toContain(state3);
      expect(player._transitionState._from.length).toEqual(2);
    });
  });

  describe('playAnimation', () => {
    it('should return a rejected promise if _prepareCurrentState fails', async () => {
      const promise = player.playAnimation('state5');

      try {
        await promise;
      } catch (e) {}

      await expect(promise).toReject();
    });

    it('should execute the onError function if _prepareCurrentState fails', async () => {
      const onError = jest.fn().mockName('onError');

      try {
        await player.playAnimation('state5', 0, undefined, undefined, onError);
      } catch (e) {}

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('should return the play promise of the new current state if _prepareCurrentState succeeds', () => {
      state2.play = jest.fn(() => state2._promises.play);
      const result = player.playAnimation('state2');

      expect(result).toEqual(state2._promises.play);
    });
  });

  describe('cancelAnimation', () => {
    it('should execute cancel on the current state', () => {
      player.cancelAnimation();

      expect(state1.cancel).toHaveBeenCalledTimes(1);
    });

    it('should return true if the current state was not null', () => {
      state1.cancel = jest.fn(() => true);

      expect(player.cancelAnimation()).toBeTrue();
    });

    it('should return false if the current state was null', () => {
      player._currentState = null;

      expect(player.cancelAnimation()).toBeFalse();
    });
  });

  describe('pauseAnimation', () => {
    it('should execute pause on the current state', () => {
      player.pauseAnimation();

      expect(state1.pause).toHaveBeenCalledTimes(1);
    });

    it('should return true if the current state was not null', () => {
      state1.pause = jest.fn(() => true);

      expect(player.pauseAnimation()).toBeTrue();
    });

    it('should return false if the current state was null', () => {
      player._currentState = null;

      expect(player.pauseAnimation()).toBeFalse();
    });
  });

  describe('resumeAnimation', () => {
    it('should return a rejected promise if _prepareCurrentState fails', () => {
      return expect(player.resumeAnimation('state5')).toReject();
    });

    it('should execute the onError function if _prepareCurrentState fails', async () => {
      const onError = jest.fn().mockName('onError');

      try {
        await player.resumeAnimation('state5', 0, undefined, undefined, onError);
      } catch (e) {}

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('should return the play promise of the new current state if _prepareCurrentState succeeds', () => {
      state2.resume = jest.fn(() => state2._promises.play);
      const result = player.resumeAnimation('state2');

      expect(result).toEqual(state2._promises.play);
    });

    it('should execute resume on the current state if no input name is defined', () => {
      player.resumeAnimation();

      expect(state1.resume).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopAnimation', () => {
    it('should execute stop on the current state', () => {
      player.stopAnimation();

      expect(state1.stop).toHaveBeenCalledTimes(1);
    });

    it('should return true if the current state was not null', () => {
      state1.stop = jest.fn(() => true);

      expect(player.stopAnimation()).toBeTrue();
    });

    it('should return false if the current state was null', () => {
      player._currentState = null;

      expect(player.stopAnimation()).toBeFalse();
    });
  });

  describe('update', () => {
    it('should execute update on the current state', () => {
      player.update(200);

      expect(state1.update).toHaveBeenCalledWith(200);
    });
  });

  describe('discard', () => {
    it('should execute discard on the transition state', () => {
      const onDiscard = jest.spyOn(player._transitionState, 'discard');
      player.discard();

      expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('should remove reference to the transition state', () => {
      expect(player._transitionState).toBeDefined();

      player.discard();

      expect(player.discarded).toBeTrue();
    });
  });
});
