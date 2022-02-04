import {AbstractState} from '@core/animpack/state/AbstractState';
import {Deferred} from '@core/Deferred';

describe('AbstractState', () => {
  let state: AbstractState;

  beforeEach(() => {
    state = new AbstractState();
  });

  describe('weight', () => {
    it('should return a number', () => {
      expect(typeof state.weight).toEqual('number');
    });

    it('should be clamped between 0 and 1', () => {
      expect(state.weight).toEqual(0);

      state.weight = 10;
      expect(state.weight).toEqual(1);

      state.weight = -10;
      expect(state.weight).toEqual(0);
    });
  });

  describe('weightPending', () => {
    it('should return true if the weight promise has not been resolved, rejected or canceled', () => {
      state._promises.weight = new Deferred();
      expect(state.weightPending).toBeTrue();
    });

    it('should return false if the weight promise has been resolved', () => {
      state._promises.weight = new Deferred();
      expect(state.weightPending).toBeTrue();

      state._promises.weight.resolve();
      expect(state.weightPending).toBeFalse();
    });

    it('should return false if the weight promise has been rejected', () => {
      state._promises.weight = new Deferred();
      expect(state.weightPending).toBeTrue();

      state._promises.weight.reject();
      state._promises.weight.catch((e: any) => {});
      expect(state.weightPending).toBeFalse();
    });

    it('should return false if the weight promise has been canceled', () => {
      state._promises.weight = new Deferred();
      expect(state.weightPending).toBeTrue();

      state._promises.weight.cancel();
      expect(state.weightPending).toBeFalse();
    });
  });

  describe('setWeight', () => {
    it('should return a deferred promise', () => {
      const interpolator = state.setWeight(1);

      expect(interpolator).toBeInstanceOf(Deferred);
    });

    it('should update the weight value when the promise is executed', () => {
      const interpolator = state.setWeight(1, 1) as Deferred;

      expect(state.weight).toEqual(0);

      interpolator.execute(250);
      expect(state.weight).toEqual(0.25);
    });

    // TODO: Fix
    it('should resolve once the weight reaches the target value', async () => {
      const interpolator = state.setWeight(1, 1) as Deferred;

      interpolator.execute(1000);

      await expect(interpolator).toResolve();
    });
  });

  describe('updateInternalWeight', () => {
    it('should update the _internalWeight property', () => {
      state.weight = 1;
      state.updateInternalWeight(1);

      const currentWeight = state._internalWeight;

      state.updateInternalWeight(0.5);
      expect(state._internalWeight).not.toEqual(currentWeight);
    });

    it('should set the _internal weight to the value of weight multiplied by the input factor', () => {
      state.weight = 0.5;
      state.updateInternalWeight(0.5);

      expect(state._internalWeight).toEqual(0.25);
    });
  });

  describe('update', () => {
    it('should execute all stored promises if _paused is false', () => {
      state._promises = {
        weight: new Deferred(),
        play: new Deferred(),
        finish: new Deferred(),
        timer: new Deferred(),
        timeScale: new Deferred(),
      };

      const onExecuteWeight = jest.spyOn(state._promises.weight, 'execute').mockImplementation();
      const onExecutePlay = jest.spyOn(state._promises.play, 'execute').mockImplementation();
      const onExecuteFinish = jest.spyOn(state._promises.finish, 'execute').mockImplementation();

      state._paused = true;
      state.update(200);
      expect(onExecuteWeight).not.toHaveBeenCalled();
      expect(onExecutePlay).not.toHaveBeenCalled();
      expect(onExecuteFinish).not.toHaveBeenCalled();

      state._paused = false;
      state.update(200);
      expect(onExecuteWeight).toHaveBeenCalledTimes(1);
      expect(onExecutePlay).toHaveBeenCalledTimes(1);
      expect(onExecuteFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('play', () => {
    it('should set _paused to false', () => {
      state._paused = true;
      state.play();

      expect(state._paused).toBeFalse();
    });

    it('should create and store new play and finish promises', () => {
      const playPromise = state._promises.play;
      const finishPromise = state._promises.finish;

      state.play();

      expect(state._promises.play).not.toEqual(playPromise);
      expect(state._promises.finish).not.toEqual(finishPromise);
    });

    it('should return a deferred promise', () => {
      expect(state.play()).toBeInstanceOf(Deferred);
    });
  });

  describe('pause', () => {
    it('should set _paused to true', () => {
      state._paused = false;
      state.pause();

      expect(state._paused).toBeTrue();
    });

    it('should return a boolean', () => {
      expect(typeof state.pause()).toEqual('boolean');
    });
  });

  describe('resume', () => {
    it('should set _paused to false', () => {
      state._paused = true;
      state.resume();

      expect(state._paused).toBeFalse();
    });

    it('should create and store new play and finish promises if the current play promise is no longer pending', () => {
      state._promises = {
        play: new Deferred(),
        finish: new Deferred(),
        weight: null,
        timer: null,
        timeScale: null,
      };

      const playPromise = state._promises.play;
      const finishPromise = state._promises.finish;

      state.resume();
      let playEqual = state._promises.play === playPromise;
      let finishEqual = state._promises.finish === finishPromise;

      expect(playEqual).toBeTrue();
      expect(finishEqual).toBeTrue();

      playPromise.resolve();
      state.resume();
      playEqual = state._promises.play === playPromise;
      finishEqual = state._promises.finish === finishPromise;

      expect(playEqual).toBeFalse();
      expect(finishEqual).toBeFalse();
    });

    it('should return a deferred promise', () => {
      expect(state.resume()).toBeInstanceOf(Deferred);
    });
  });

  describe('cancel', () => {
    it('should set _paused to true', () => {
      state._paused = false;
      state.cancel();

      expect(state._paused).toBeTrue();
    });

    it('should cancel all stored promises', async () => {
      state._promises = {
        weight: new Deferred(),
        play: new Deferred(),
        finish: new Deferred(),
        timer: new Deferred(),
        timeScale: new Deferred(),
      };
      const onCancelWeight = jest.spyOn(state._promises.weight, 'cancel');
      const onCancelPlay = jest.spyOn(state._promises.play, 'cancel');
      const onCancelFinish = jest.spyOn(state._promises.finish, 'cancel');

      state.cancel();

      expect(onCancelWeight).toHaveBeenCalledTimes(1);
      expect(onCancelPlay).toHaveBeenCalledTimes(1);
      expect(onCancelFinish).toHaveBeenCalledTimes(1);
      await expect(state._promises.weight).toResolve();
      await expect(state._promises.play).toResolve();
      await expect(state._promises.finish).toResolve();
    });

    it('should return a boolean', () => {
      expect(typeof state.cancel()).toEqual('boolean');
    });
  });

  describe('stop', () => {
    it('should set _paused to true', () => {
      state._paused = false;
      state.stop();

      expect(state._paused).toBeTrue();
    });

    it('should resolve all stored promises', async () => {
      state._promises = {
        play: new Deferred(),
        weight: new Deferred(),
        finish: new Deferred(),
        timer: new Deferred(),
        timeScale: new Deferred(),
      };
      const onResolveWeight = jest.spyOn(state._promises.weight, 'resolve');
      const onResolvePlay = jest.spyOn(state._promises.play, 'resolve');
      const onResolveFinish = jest.spyOn(state._promises.finish, 'resolve');

      state.stop();

      expect(onResolveWeight).toHaveBeenCalledTimes(1);
      expect(onResolvePlay).toHaveBeenCalledTimes(1);
      expect(onResolveFinish).toHaveBeenCalledTimes(1);
      await expect(state._promises.weight).toResolve();
      await expect(state._promises.play).toResolve();
      await expect(state._promises.finish).toResolve();
    });

    it('should return a boolean', () => {
      expect(typeof state.stop()).toEqual('boolean');
    });
  });

  describe('discard', () => {
    it('should cancel the state', () => {
      const onCancel = jest.spyOn(state, 'cancel').mockImplementation();

      state.discard();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should remove reference to promises', () => {
      expect(state._promises).toBeDefined();

      state.discard();
      expect(state._discarded).toBeTrue();
    });
  });

  describe('deactivate', () => {
    it('should execute updateInternalWeight with a value of 0', () => {
      const onUpdateInternalWeight = jest.spyOn(state, 'updateInternalWeight').mockImplementation();

      state.deactivate();
      expect(onUpdateInternalWeight).toHaveBeenCalledWith(0);
    });
  });
});
