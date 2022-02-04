import {QueueState} from '@core/animpack/state/QueueState';
import {Deferred} from '@core/Deferred';

describe('QueueState', () => {
  let queueState: QueueState;
  let state1: any;
  let state2: any;
  let state3: any;

  beforeEach(() => {
    state1 = {
      name: 'state1',
      weight: 1,
      loopCount: 1,
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
      weight: 1,
      loopCount: Infinity,
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
      name: 'state3',
      weight: 1,
      loopCount: 2,
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
    queueState = new QueueState({}, [state1, state2, state3]);
  });

  describe('_reset', () => {
    it('should set _done to false if there are stored states', () => {
      queueState._done = true;
      queueState._reset();

      expect(queueState._done).toBeFalse();
    });

    it('should set _done to true if there are no stored states', () => {
      queueState._done = false;
      queueState._states = new Map();
      queueState._reset();

      expect(queueState._done).toBeTrue();
    });

    it('should return the name of the first stored state if there are stored states', () => {
      expect(queueState._reset()).toEqual('state1');
    });

    it('should return null if there are no stored states', () => {
      queueState._states = new Map();

      expect(queueState._reset()).toEqual(null);
    });
  });

  describe('updateInternalWeight', () => {
    it('should execute updateInternalWeight with _internalWeight on the current state if there is one', () => {
      queueState._currentState = state1;
      queueState.updateInternalWeight(1);

      expect(state1.updateInternalWeight).toHaveBeenCalledWith(queueState._internalWeight);
    });

    it('should not throw an error if there is no current state', () => {
      queueState._currentState = null;

      expect(() => {
        queueState.updateInternalWeight(1);
      }).not.toThrowError();
    });
  });

  describe('next', () => {
    it('should return a Deferred promise', () => {
      expect(queueState.next()).toBeInstanceOf(Deferred);
    });

    it('should advance _queue by calling its next method', () => {
      const onNext = jest.spyOn(queueState._queue, 'next').mockImplementation(() => {
        return {value: 'state1', done: false};
      });

      queueState.next();

      expect(onNext).toHaveBeenCalledTimes(1);
      onNext.mockRestore();
    });

    it('should set the value of _done to the done result of _queue.next', () => {
      queueState._done = false;

      const onNext = jest.spyOn(queueState._queue, 'next').mockImplementation(() => {
        return {value: undefined, done: true};
      });

      queueState.next();

      expect(queueState._done).toBeTrue();
      onNext.mockRestore();
    });

    it('should resolve and return the finish promise if _done gets updated to true and the wrap input parameter is false', () => {
      queueState._promises.finish = new Deferred();

      const onNext = jest.spyOn(queueState._queue, 'next').mockImplementation(() => {
        return {value: undefined, done: true};
      });
      const result = queueState.next(undefined, false);

      expect(result).toEqual(queueState._promises.finish);
      onNext.mockRestore();
      return expect(result).toResolve();
    });

    it('should execute play if _done gets updated to true and the wrap input parameter is true', () => {
      const onPlay = jest.spyOn(queueState, 'play');
      const onNext = jest.spyOn(queueState._queue, 'next').mockImplementation(() => {
        return {value: undefined, done: true};
      });

      queueState.next(() => {}, true);

      expect(onPlay).toHaveBeenCalledTimes(1);
      onNext.mockRestore();
    });

    it("should execute the onNext input function with {name: name of next state in the queue, canAdvance: true if next state's loopCount is less than Infinity and not the last state in the queue, isQueueEnd: true if it's the last state in the queue} if _done gets updated to false", () => {
      const onNext = jest.fn().mockName('onNext');

      queueState.next(onNext);

      expect(onNext).toHaveBeenCalledWith({
        name: 'state1',
        canAdvance: true,
        isQueueEnd: false,
      });

      queueState.next(onNext);

      expect(onNext).toHaveBeenCalledWith({
        name: 'state2',
        canAdvance: false,
        isQueueEnd: false,
      });

      queueState.next(onNext);

      expect(onNext).toHaveBeenCalledWith({
        name: 'state3',
        canAdvance: false,
        isQueueEnd: true,
      });
    });

    it('should execute playAnimation if done is updated to false', () => {
      const onPlay = jest.spyOn(queueState, 'playAnimation');

      queueState.next();

      expect(onPlay).toHaveBeenCalledTimes(1);
    });
  });

  describe('play', () => {
    it('should return a Deferred promise', () => {
      expect(queueState.play()).toBeInstanceOf(Deferred);
    });

    it('should advance _queue by calling _reset', () => {
      const onReset = jest.spyOn(queueState, '_reset').mockImplementation(() => {
        queueState._done = false;
        return 'state1';
      });

      queueState.play();

      expect(onReset).toHaveBeenCalledTimes(1);
      onReset.mockRestore();
    });

    it('should resolve and return the finish promise if _done gets updated to true', () => {
      state1.play = jest.fn((onFinished: any) => {
        return onFinished();
      });

      queueState._promises.finish = new Deferred();

      const onNext = jest.spyOn(Object.getPrototypeOf(queueState._queue), 'next').mockReturnValue({value: undefined, done: true});

      const result = queueState.play();

      expect(result).toEqual(queueState._promises.finish);
      onNext.mockRestore();
      return expect(result).toResolve();
    });

    it("should execute the onNext input function with {name: name of first state in the queue, canAdvance: true if first state's loopCount not Infinity and not the last state in the queue, isQueueEnd: true if it's the last state in the queue} if _done gets updated to false", () => {
      const onNext = jest.fn().mockName('onNext');

      queueState.play(undefined, undefined, undefined, onNext);

      expect(onNext).toHaveBeenCalledWith({
        name: 'state1',
        canAdvance: true,
        isQueueEnd: false,
      });

      queueState.next();
      queueState.play(undefined, undefined, undefined, onNext);

      expect(onNext).toHaveBeenCalledWith({
        name: 'state1',
        canAdvance: true,
        isQueueEnd: false,
      });
    });

    it('should execute playAnimation if done is updated to false', () => {
      const onPlay = jest.spyOn(queueState, 'playAnimation');

      queueState.next();

      expect(onPlay).toHaveBeenCalledTimes(1);
      onPlay.mockRestore();
    });
  });

  describe('pause', () => {
    it('should execute pauseAnimation', () => {
      const onPause = jest.spyOn(queueState, 'pauseAnimation');

      queueState.pause();

      expect(onPause).toHaveBeenCalledTimes(1);
    });
  });

  describe('resume', () => {
    it('should return a Deferred promise', () => {
      expect(queueState.resume()).toBeInstanceOf(Deferred);
    });

    it('should execute play if _done is true', () => {
      queueState._done = true;

      const onPlay = jest.spyOn(queueState, 'play').mockName('play');

      queueState.resume();

      expect(onPlay).toHaveBeenCalledTimes(1);
    });

    it('should execute resumeAnimation if _done is false', () => {
      queueState._done = false;
      queueState._currentState = state1;

      const onResume = jest.spyOn(queueState, 'resumeAnimation').mockName('resumeAnimation');

      queueState.resume();

      expect(onResume).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('should execute cancel on the current state if there is one', () => {
      queueState._currentState = state1;
      queueState.cancel();

      expect(state1.cancel).toHaveBeenCalledTimes(1);
    });

    it('should not throw an error if there is no current state', () => {
      queueState._currentState = null;

      expect(() => {
        queueState.cancel();
      }).not.toThrowError();
    });
  });

  describe('stop', () => {
    it('should execute stopAnimation', () => {
      const onStop = jest.spyOn(queueState, 'stopAnimation');

      queueState.stop();

      expect(onStop).toHaveBeenCalledTimes(1);
    });
  });
});
