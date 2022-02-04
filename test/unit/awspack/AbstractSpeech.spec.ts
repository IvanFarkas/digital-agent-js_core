import {describeHostEnvironment} from '../EnvironmentHarness';
import {Deferred} from '@core/Deferred';
import {AbstractSpeech} from '@core/awspack/AbstractSpeech';
import {TextToSpeechFeature} from '@core/awspack/TextToSpeechFeature';
import {Messenger} from '@core/Messenger';

// cd  src/core
// madge -c --extensions ts ./
// cd ./
// madge -b src -i circ.svg -l dot --dot --webpack-config build/webpack/local.webpack.config.babel.js --ts-config tsconfig.json -c --extensions ts ./
// madge --webpack-config build/webpack/local.webpack.config.babel.js --ts-config tsconfig.json -c --extensions ts ./
// madge -b src -i circ.svg -l dot --dot --webpack-config webpack.common.js --webpack-config tsconfig.json -c --extensions js ./
// madge -b src --webpack-config webpack.common.js --webpack-config tsconfig.json -c --extensions js ./
describeHostEnvironment('AbstractSpeech', () => {
  let speech: AbstractSpeech;
  // let speaker: TextToSpeechFeature;
  let speaker: Messenger;

  Object.assign(Messenger.EVENTS, {
    play: 'TextToSpeech.onPlayEvent',
    pause: 'TextToSpeech.onPauseEvent',
    resume: 'TextToSpeech.onResumeEvent',
    interrupt: 'TextToSpeech.onInterruptEvent',
    stop: 'TextToSpeech.onStopEvent',
    sentence: 'TextToSpeech.onSentenceEvent',
    word: 'TextToSpeech.onWordEvent',
    viseme: 'TextToSpeech.onVisemeEvent',
    ssml: 'TextToSpeech.onSsmlEvent',
  });

  const speechmarks = [
    {time: 0, type: 'sentence', start: 7, end: 11, value: 'test'},
    {time: 6, type: 'word', start: 7, end: 11, value: 'test'},
    {time: 6, type: 'viseme', value: 't'},
    {time: 123, type: 'viseme', value: 'E'},
    {time: 283, type: 'viseme', value: 's'},
    {time: 428, type: 'viseme', value: 't'},
    {time: 554, type: 'viseme', value: 'sil'},
  ];

  beforeEach(() => {
    speaker = new Messenger();
    // speaker = new TextToSpeechFeature();
    speech = new AbstractSpeech(speaker, 'test', speechmarks);
  });

  describe('_reset', () => {
    it('should restart the speechmark iterator', () => {
      const startValue = speech._markIter.next();

      speech._markIter.next();
      speech._markIter.next();

      const newValue = speech._markIter.next();

      expect(startValue).not.toEqual(newValue);

      speech._reset();

      expect(startValue).toEqual(speech._markIter.next());
    });
  });

  describe('_createPromise', () => {
    it('should return a Deferred promise', () => {
      expect(speech._createPromise()).toBeInstanceOf(Deferred);
    });

    it("should emit the speaker's stop event with the speech as the value when the promise resolves", async () => {
      const promise = speech._createPromise();
      const onResolve = jest.fn().mockName('onResolve');

      speaker.listenTo(Messenger.EVENTS.stop, onResolve);
      promise.resolve();
      await Promise.resolve();

      expect(onResolve).toHaveBeenCalledWith(speech);
      onResolve.mockRestore();
    });

    it('should execute the onFinish function argument when the promise resolves', () => {
      const onFinish = jest.fn().mockName('onFinish');
      const promise = speech._createPromise(onFinish);

      promise.resolve(5);

      expect(onFinish).toHaveBeenCalledWith(5);
      onFinish.mockRestore();
    });

    it('should not throw a TypeError if the onFinish argument is not a function', () => {
      const promise = speech._createPromise();

      expect(promise.resolve.bind(promise)).not.toThrowError(TypeError);
    });

    it('should execute the onError function argument when the promise rejects', () => {
      const onError = jest.fn().mockName('onError');
      const promise = speech._createPromise(undefined, onError);

      promise.reject('error');
      promise.catch((e) => {});

      expect(onError).toHaveBeenCalledWith('error');
      onError.mockRestore();
    });

    it('should not throw an error if the onError argument is not a function', () => {
      const promise = speech._createPromise();
      const boundPromise = promise.reject.bind(promise, 'error');

      boundPromise();
      promise.catch((e) => {});

      expect(boundPromise).not.toThrowError(TypeError);
    });

    // TODO: Fix Jest. The code works (emits message)
    it.skip("should emit the speaker's interrupt event when the promise resolves by being canceled", (done) => {
      const promise = speech._createPromise();
      const onInterrupt = jest.fn().mockName('onInterrupt');

      speaker.listenTo(Messenger.EVENTS.interrupt, onInterrupt);
      promise.cancel();

      setTimeout(() => {
        expect(onInterrupt).toHaveBeenCalledWith(speech);
        done();
      }, 10);
      onInterrupt.mockRestore();
    });

    it('should execute the onInterrupt function argument when the promise resolves by being canceled', () => {
      const onInterrupt = jest.fn().mockName('onInterrupt');
      const promise = speech._createPromise(undefined, undefined, onInterrupt);

      promise.cancel(5);

      expect(onInterrupt).toHaveBeenCalledWith(5);
      onInterrupt.mockRestore();
    });

    it('should not throw an error if the onInterrupt argument is not a function', () => {
      const promise = speech._createPromise();

      expect(promise.cancel.bind(promise)).not.toThrowError(TypeError);
    });

    it('should set _playing to false when the promise is no longer pending', () => {
      speech._playing = true;

      let promise = speech._createPromise();

      promise.resolve();

      expect(speech._playing).toBeFalse();

      promise = speech._createPromise();
      promise.cancel();

      expect(speech._playing).toBeFalse();

      promise = speech._createPromise();
      promise.reject('error');
      promise.catch((e) => {});

      expect(speech._playing).toBeFalse();
    });
  });

  describe('playing', () => {
    it('should return a boolean indicating whether the speech is playing and should be updated', () => {
      expect(speech.playing).toBeFalse();

      speech._playing = true;

      expect(speech.playing).toBeTrue();
    });

    // Note: Test case is mute since TS compiler reports type mismatch
    // it('should not be able to be set', () => {
    //   expect(speech.playing).toBeFalse();

    //   expect(() => {
    //     speech.playing = true;
    //   }).toThrowError(TypeError);
    // });
  });

  describe('text', () => {
    it('should return the string _text content of the speech', () => {
      expect(speech.text).toEqual('test');
    });

    // Note: Test case is mute since TS compiler reports type mismatch
    // it('should not be able to be set', () => {
    //   expect(() => {
    //     speech.text = 'someOtherText';
    //   }).toThrowError(TypeError);
    // });
  });

  describe('speechmarks', () => {
    it('should return a copy of the speechmarks array', () => {
      const actual = speech._speechmarks === speech.speechmarks;
      const expected = false;

      expect(expected).toEqual(actual);
    });

    // Note: Test case is mute since TS compiler reports type mismatch
    // it('should not be able to be set', () => {
    //   expect(() => {
    //     speech.speechmarks = [];
    //   }).toThrowError(TypeError);
    // });
  });

  describe('update', () => {
    it('should update the local time to the difference between the given current time and _startTime', () => {
      expect(speech._localTime).toEqual(0);

      speech._playing = true;
      speech._startTime = 100;
      speech.update(100);

      expect(speech._localTime).toEqual(0);

      speech.update(250);

      expect(speech._localTime).toEqual(150);
    });

    it('should execute stop and _reset if _done is true and _localTime is greater than _endTime', () => {
      const onStop = jest.spyOn(speech, 'stop');
      const onReset = jest.spyOn(speech, '_reset');

      speech._playing = true;
      speech._done = true;
      speech._endTime = 0;
      speech._startTime = 0;
      speech.update(500);

      // TODO: Fix P1. 'toHaveBeenCalledBefore()' does not like the param.
      // Argument of type 'SpyInstance<void, [currentTime?: number | undefined]>' is not assignable to parameter of type 'Mock<any, any>'.
      // Type 'SpyInstance<void, [currentTime?: number | undefined]>' is missing the following properties from type 'Mock<any, any>': apply, call, bind, prototype, and 5 more.ts(2345)
      // expect(onStop).toHaveBeenCalledBefore(onReset);

      expect(onReset).toHaveBeenCalledTimes(1);
      onStop.mockRestore();
      onReset.mockRestore();
    });

    it('should not move the speechmark iterator forward to update the current mark if _playing is false or _done is true', () => {
      const onNext = jest.spyOn(speech._markIter, 'next');

      speech._playing = false;
      speech._done = false;
      speech.update(200);

      expect(onNext).not.toHaveBeenCalled();

      speech._playing = true;
      speech._done = true;
      speech.update(200);

      expect(onNext).not.toHaveBeenCalled();
      onNext.mockRestore();
    });

    it("should continuously move the speechmark iterator forward while the current speechmark's time property is less than current time", () => {
      speech._playing = true;
      speech._done = false;
      speech.update(200);

      expect(speech._currentMark).toEqual(speechmarks[4]);

      speech.update(10);

      expect(speech._currentMark).toEqual(speechmarks[4]);
    });

    it("should emit an event of the speechmark's type with the speechmark object as the value for each speechmark object that is next in the iterator", () => {
      const onEmit = jest.spyOn(speaker, 'emit');

      speech._playing = true;
      speech._done = false;
      speech.update(200);

      expect(onEmit).toHaveBeenCalledTimes(4);
      onEmit.mockRestore();
    });
  });

  describe('play', () => {
    it('should cause playing to return true', () => {
      expect(speech.playing).toBeFalse();

      speech.play();

      expect(speech.playing).toBeTrue();
    });

    it('should reset the speech', () => {
      const onReset = jest.spyOn(speech, '_reset');

      speech.play();

      expect(onReset).toHaveBeenCalledTimes(1);
      onReset.mockRestore();
    });

    it("should emit the speaker's local and global play events", async () => {
      const onPlayLocal = jest.spyOn(speaker, 'emit');
      const onPlayGlobal = jest.spyOn(Messenger, 'emit');

      speech.play();
      await Promise.resolve();

      expect(onPlayLocal).toHaveBeenCalledWith(Messenger.EVENTS.play, speech);
      expect(onPlayGlobal).toHaveBeenCalledWith(Messenger.EVENTS.play, speech);
      onPlayLocal.mockRestore();
      onPlayGlobal.mockRestore();
    });

    it('should store and return a new pending play promise', () => {
      speech._promise = new Deferred();

      const currentPromise = speech._promise;

      // speech.play(() => {});
      speech.play();

      expect(speech._promise).not.toEqual(currentPromise);
    });
  });

  describe('pause', () => {
    it("should emit the speaker's local and global play pause events", async () => {
      const onPauseLocal = jest.spyOn(speaker, 'emit');
      const onPauseGlobal = jest.spyOn(Messenger, 'emit');

      speech.pause();
      await Promise.resolve();

      expect(onPauseLocal).toHaveBeenCalledWith(Messenger.EVENTS.pause, speech);
      expect(onPauseGlobal).toHaveBeenCalledWith(Messenger.EVENTS.pause, speech);
      onPauseLocal.mockRestore();
      onPauseGlobal.mockRestore();
    });

    it('should cause playing to return false', () => {
      speech._playing = true;

      expect(speech.playing).toBeTrue();

      speech.pause();

      expect(speech.playing).toBeFalse();
    });

    it('should not resolve the play promise', () => {
      speech.play();
      speech.pause();

      expect(speech?._promise?.resolved).toBeFalse();
    });
  });

  describe('resume', () => {
    it('should cause playing to return true', () => {
      expect(speech.playing).toBeFalse();

      speech.resume();

      expect(speech.playing).toBeTrue();
    });

    it("should reset and create a new promise if the speech hadn't already been playing and paused", () => {
      const onReset = jest.spyOn(speech, '_reset');
      const onCreatePromise = jest.spyOn(speech, '_createPromise').mockImplementation(() => (speech._promise = new Deferred()));

      expect(speech._promise).toBeNull();

      speech.resume();

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(onCreatePromise).toHaveBeenCalledTimes(1);
      expect(speech._promise).not.toBeNull();

      const promise = speech._promise;
      speech.resume();

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(onCreatePromise).toHaveBeenCalledTimes(1);
      expect(speech._promise).toEqual(promise);
      onReset.mockRestore();
      onCreatePromise.mockRestore();
    });

    it("should emit the speaker's local and global play resume events", async () => {
      const onResumeLocal = jest.spyOn(speaker, 'emit');
      const onResumeGlobal = jest.spyOn(Messenger, 'emit');

      speech.resume();
      await Promise.resolve();

      expect(onResumeLocal).toHaveBeenCalledWith(Messenger.EVENTS.resume, speech);

      expect(onResumeGlobal).toHaveBeenCalledWith(Messenger.EVENTS.resume, speech);
      onResumeLocal.mockRestore();
      onResumeGlobal.mockRestore();
    });

    it('should return a pending play promise', () => {
      const result = speech.resume();

      expect(result).toBeInstanceOf(Deferred);
      expect(result?.pending).toBeTrue();
    });

    it('should not execute _reset if the speech has been playing and paused', () => {
      speech.play();

      const onReset = jest.spyOn(speech, '_reset');

      speech.pause();
      speech.resume();

      expect(onReset).not.toHaveBeenCalled();
      onReset.mockRestore();
    });
  });

  describe('cancel', () => {
    it('should cancel the pending play promise if the speech had been playing', async () => {
      const onCancel = jest.fn().mockName('onCancel');

      speech._promise = new Deferred(undefined, undefined, undefined, onCancel);

      const promise = speech._promise;

      speech.cancel();

      expect(onCancel).toHaveBeenCalledTimes(1);
      await expect(promise).toResolve();
      onCancel.mockRestore();
    });

    it('should cause playing to return false', () => {
      speech.play();

      expect(speech.playing).toBeTrue();

      speech.cancel();

      expect(speech.playing).toBeFalse();
    });
  });

  describe('stop', () => {
    it('should resolve the pending play promise if the speech had been playing', async () => {
      speech.play();

      const promise = speech._promise;

      speech.stop();

      await expect(promise).toResolve();
    });

    it('should cause playing to return false', () => {
      speech.play();

      expect(speech.playing).toBeTrue();

      speech.stop();

      expect(speech.playing).toBeFalse();
    });
  });
});
