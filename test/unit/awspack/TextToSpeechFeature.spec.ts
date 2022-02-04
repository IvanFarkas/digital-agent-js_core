import {describeHostEnvironment} from '../EnvironmentHarness';
import {createSpyObj} from '../Util';
import {Audio, AudioListener, PositionalAudio, Object3D} from 'three';
import {TextToSpeechFeature} from '@core/awspack/TextToSpeechFeature';
import {Messenger} from '@core/Messenger';
import {Speech} from '@core/awspack/Speech';

jest.mock('aws-sdk/clients/polly');

describeHostEnvironment('TextToSpeechFeature', (options: any, env: string) => {
  let mockHost: Messenger;
  const mockNeuralVersion = '2.1052.0';

  beforeEach(async () => {
    mockHost = new Messenger();

    // mock AWS.Polly
    const mockPolly = createSpyObj('Polly', ['describeVoices']);

    mockPolly.describeVoices.mockReturnValue({
      promise: jest.fn().mockReturnValue(
        Promise.resolve({
          Voices: [
            {
              Gender: 'Female',
              Id: 'Emma',
              LanguageCode: 'en-US',
              LanguageName: 'US English',
              Name: 'Emma',
              SupportedEngines: ['standard'],
            },
            {
              Gender: 'Male',
              Id: 'Brian',
              LanguageCode: 'en-GB',
              LanguageName: 'British English',
              Name: 'Brian',
              SupportedEngines: ['standard', 'neural'],
            },
            {
              Gender: 'Female',
              Id: 'Amy',
              LanguageCode: 'en-GB',
              LanguageName: 'British English',
              Name: 'Amy',
              SupportedEngines: ['standard'],
            },
          ],
        })
      ),
    });

    // mock AWS.Polly.Presigner
    const mockPresigner = createSpyObj('Polly.Presigner', ['getSynthesizeSpeechUrl']);

    mockPresigner.getSynthesizeSpeechUrl((_params: any, fn: any) => {
      fn(undefined, '../../assets/audio.mp3');
    });

    await TextToSpeechFeature.initializeService(mockPolly, mockPresigner, mockNeuralVersion);
  });

  describe('_createSpeech', () => {
    it.skip('should return an object that extends Speech', async () => {
      const tts = new TextToSpeechFeature(mockHost);
      const speech = tts._createSpeech('', [], {
        audio: {
          onended: jest.fn().mockName('onended'),
          onEndedObservable: {add: jest.fn().mockName('add')},
        },
      });

      expect(speech).toBeInstanceOf(Speech);
    });
  });

  describe('_synthesizeAudio', () => {
    switch (env) {
      case 'three':
        describe('Three Synthesize Audio', () => {
          it.skip("should return a promise that resolves to an object with an audio property that's and instance of Audio", async () => {
            const listener = new AudioListener();
            const tts = new TextToSpeechFeature(mockHost, {listener});
            const promise = tts._synthesizeAudio({});

            expect(promise).toBeInstanceOf(Promise);

            const result = await promise;

            expect(result).toBeInstanceOf(Object);
            // @ts-ignore
            expect(result.audio).toBeDefined();
            // @ts-ignore
            expect(result.audio).toBeInstanceOf(Audio);
          });

          it.skip("should return a promise that resolves to an object with a threeAudio property that's and instance of Audio", async () => {
            const listener = new AudioListener();
            const tts = new TextToSpeechFeature(mockHost, {listener});
            const promise = tts._synthesizeAudio({});

            const result = await promise;

            // @ts-ignore
            expect(result.threeAudio).toBeDefined();
            // @ts-ignore
            expect(result.threeAudio).toBeInstanceOf(Audio);
          });

          it.skip("should return a promise that resolves to an object with a threeAudio property that's and instance of PositionalAudio if attachTo is defined in the constructor options", async () => {
            const listener = new AudioListener();
            const attachTo = new Object3D();
            const tts = new TextToSpeechFeature(mockHost, {listener, attachTo});
            const promise = tts._synthesizeAudio({});

            const result = await promise;

            // @ts-ignore
            expect(result.threeAudio).toBeDefined();
            // @ts-ignore
            expect(result.threeAudio).toBeInstanceOf(PositionalAudio);
          });
        });
        break;

      case 'core':
      default:
        describe('Core Synthesize Audio', () => {
          it.skip("should return a promise that resolves to an object with an audio property that's an instance of Audio", async () => {
            const tts = new TextToSpeechFeature(mockHost);
            const promise = tts._synthesizeAudio({});

            expect(promise).toBeInstanceOf(Promise);

            const result = await promise;

            expect(result).toBeInstanceOf(Object);
            // @ts-ignore
            expect(result.audio).toBeDefined();
            // @ts-ignore
            expect(result.audio).toBeInstanceOf(Audio);
          });
        });
        break;
    }
  });
});
