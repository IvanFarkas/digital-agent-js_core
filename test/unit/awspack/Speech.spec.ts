// tslint:disable: no-string-literal
import {Env} from '@core/Utils';
import {describeHostEnvironment} from '../EnvironmentHarness';
import {Audio, AudioListener} from 'three';
import {Speech} from '@core/awspack/Speech';
import {Messenger} from '@core/Messenger';

describeHostEnvironment('Speech', (_options: any, env: string) => {
  let speech: Speech;
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

  beforeEach(() => {
    speaker = new Messenger();
    const mockAudio = {
      play: jest.fn().mockName('play'),
      pause: jest.fn().mockName('pause'),
      stop: jest.fn().mockName('stop'),
      onEndedObservable: {add: jest.fn().mockName('add')},
      currentTime: 0,
      paused: true,
    };
    mockAudio.play = jest
      .fn(() => {
        mockAudio.paused = false;
        return Promise.resolve();
      })
      .mockName('play');
    mockAudio.pause = jest
      .fn(() => {
        mockAudio.paused = true;
      })
      .mockName('pause');

    const audioConfig = {audio: mockAudio};
    if (env === Env.Three) {
      // TODO: Fix P1. TypeError: (window.AudioContext || window.webkitAudioContext) is not a constructor
      // const audioListener = new AudioListener();
      // const audio = new Audio(audioListener);
      // audioConfig['threeAudio'] = audio;
      // mockAudio.play = jest.fn().mockName('play');
      // mockAudio.pause = jest.fn().mockName('pause');
    }

    speech = new Speech(speaker, '', [], audioConfig);
  });

  describe('Common Speech', () => {
    describe('pause', () => {
      it('should execute pause on _audio', async () => {
        speech.pause();
        await Promise.resolve();

        expect(speech.audio.pause).toHaveBeenCalled();
      });
    });

    describe('resume', () => {
      it('should execute play on _audio', () => {
        speech.resume();

        expect(speech.audio.play).toHaveBeenCalled();
      });

      it("should not set _audio's currentTime back to 0", () => {
        speech.audio.currentTime = 10;

        speech.resume();

        expect(speech.audio.currentTime).toEqual(10);
      });
    });

    describe('cancel', () => {
      it('should execute pause on _audio', async () => {
        speech.cancel();
        await Promise.resolve();

        expect(speech.audio.pause).toHaveBeenCalled();
      });
    });
  });

  switch (env) {
    case Env.Three:
      describe('Three Speech', () => {
        describe('audio', () => {
          it.skip('should be an instance of Audio', () => {
            expect(speech.audio).toBeInstanceOf(Audio);
          });
        });

        describe('play', () => {
          it.skip('should disconnect and re-connect _audio', () => {
            const onDisonnect = jest.spyOn(speech.audio, 'disconnect');
            const onConnect = jest.spyOn(speech.audio, 'connect');
            speech.play();

            // TODO: Global Fix P1. Find proper use of Jest toHaveBeenCalledBefore. (Property 'toHaveBeenCalledBefore' does not exist on type 'JestMatchers<SpyInstance<any, [value?: any]>>'.)
            // expect(onDisonnect).toHaveBeenCalledBefore(onConnect);
          });
        });
      });
      break;

    case Env.Core:
    default:
      describe('Core Speech', () => {
        describe('audio', () => {
          // Note: Test case is mute since TS compiler reports type mismatch
          // it('should not be able to set', () => {
          //   expect(() => {
          //     speech._audio = 'notAudio';
          //   }).toThrowError(TypeError);
          // });
        });

        describe('play', () => {
          it("should set _audio's current time to 0", () => {
            speech.audio.currentTime = 10;

            expect(speech.audio.currentTime).not.toEqual(0);

            speech.play();

            expect(speech.audio.currentTime).toEqual(0);
          });

          it('should execute play on _audio', () => {
            speech.play();

            expect(speech.audio.paused).toBeFalse();
            expect(speech.audio.play).toHaveBeenCalled();
          });
        });

        describe('stop', () => {
          it('should execute pause on _audio', async () => {
            speech.stop();
            await Promise.resolve();

            expect(speech.audio.pause).toHaveBeenCalled();
          });

          it("should set _audio's current time to 0", () => {
            speech.audio.currentTime = 10;

            expect(speech.audio.currentTime).not.toEqual(0);

            speech.stop();

            expect(speech.audio.currentTime).toEqual(0);
          });
        });
      });
  }
});
