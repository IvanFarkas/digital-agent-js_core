import { AbstractHostFeature } from '@core/AbstractHostFeature';
import { AnimationUtils } from '@core/awspack/AnimationUtils';
import { MathUtils } from '@core/MathUtils';
import { Deferred } from '@core/Deferred';
import { HostObject } from '@core/HostObject';
import { Speech as AbstractSpeech } from '@core/awspack/AbstractSpeech';
import { TextToSpeechUtils } from '@core/awspack/TextToSpeechUtils';

/**
 * The Amazon Polly service object.
 * @external Polly
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Polly.html
 */

/**
 * The presigner object that can be used to generate presigned urls for the Polly service.
 * @external Presigner
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Polly/Presigner.html
 */

export interface ISampleRate {
  rates: string[];
  defaults: {
    standard: string;
    neural: string;
  };
}

export interface IMarkTypes {
  sentence: any[] | null;
  word: any[] | null;
  viseme: any[] | null;
  ssml: any[] | null;
}

/**
 * Base class for turning text input into playable audio. There should be one instance per speaker, each instance can play only one piece of text at a time.
 *
 * @extends HostFeature
 * @abstract
 *
 * @property {HostObject} host - The HostObject managing the feature.
 * @property {any} _speechCache - Speech Cache.
 * @property {any} _currentSpeech - Current Speech.
 * @property {any} _currentPromise - Current Promise.
 * @property {boolean} _isValidated - Is Validated.
 * @property {boolean} _isGlobal - Is Global.
 * @property {any} _promises - Promises.
 * @property {any} _volumePaused - Volume Paused.
 * @property {any} _voice - Voice.
 * @property {any} _language - Language.
 * @property {any} _engine - Engine.
 * @property {any} _audioFormat - Audio Format.
 * @property {any} _sampleRate - Sample Rate.
 * @property {boolean} _isReady - Is Ready.
 * @property {number} _speechmarkOffset - Speechmark Offset.
 * @property {number} _minEndMarkDuration - Min End Mark Duration.
 * @property {number} _volume - Volume.
 * @property {Function} emit - Emit fn.
 *
 * @property {Object} SERVICES - AWS services that are necessary for the feature to function.
 * @property {Polly} SERVICES.polly - The Polly service that is used to synthesize speechmarks. Will be undefined until [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed
 * @property {Presigner} SERVICES.presigner - The Polly Presigner object that is used to synthesize speech audio. Will be undefined until [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed.
 *
 * @property {string[]} POLLY_VOICES - An array of voices available in Polly. Will be empty until [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed. See [Polly Documentation]{@link https://docs.aws.amazon.com/polly/latest/dg/voicelist.html} for a full list of available voices.
 * @property {Object} POLLY_LANGUAGES - An object that maps language names to language codes that are available in Polly. Will be empty until [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed. See [Polly Documentation]{@link https://docs.aws.amazon.com/polly/latest/dg/SupportedLanguage.html} for a full list of available languages and corresponding codes.
 * @property {Object} POLLY_LANGUAGE_CODES - An object that maps language codes to language names that are available in Polly. Will be empty until [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed. See [Polly Documentation]{@link https://docs.aws.amazon.com/polly/latest/dg/SupportedLanguage.html} for a full list of available languages and corresponding codes.
 * @property {string} POLLY_MIN_NEURAL_VERSION - Gets the minimum version of the AWS SDK that is necessary to use neural voices with AWS Polly.
 * @property {Object} POLLY_DEFAULTS - Default values to use with calls to {@link Polly}.
 * @property {string} [POLLY_DEFAULTS.Engine='standard']
 * @property {string[]} [POLLY_DEFAULTS.LexiconNames=[]]
 * @property {string} [POLLY_DEFAULTS.OutputFormat='mp3']
 * @property {string} [POLLY_DEFAULTS.SampleRate='22050']
 * @property {string} [POLLY_DEFAULTS.Text='']
 * @property {string} [POLLY_DEFAULTS.TextType='ssml']
 * @property {string} [POLLY_DEFAULTS.VoiceId='Amy']
 * @property {string} [POLLY_DEFAULTS.LanguageCode='en-GB']
 * @property {string} [POLLY_DEFAULTS.LanguageName='British English']
 *
 * @property {Object} EVENTS - Built-in messages that the feature emits. When the feature is added to a {@link core/HostObject}, event names will be prefixed by the name of the feature class + '.'.
 * @property {string} [EVENTS.ready=onReadyEvent] - Message that is emitted after [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed.
 * @property {string} [EVENTS.play=onPlayEvent] - Message that is emitted after each call to [play]{@link AbstractTextToSpeechFeature#play}. The speech that was played is supplied as an argument to listener functions.
 * @property {string} [EVENTS.pause=onPauseEvent] - Message that is emitted after each call to [pause]{@link AbstractTextToSpeechFeature#pause}. The speech that was paused is supplied as an argument to listener functions.
 * @property {string} [EVENTS.resume=onResumeEvent] - Message that is emitted after each call to [resume]{@link AbstractTextToSpeechFeature#resume}. The speech that was resumed is supplied as an argument to listener functions.
 * @property {string} [EVENTS.interrupt=onInterruptEvent] - Message that is emitted if there is a current speech in progress and [play]{@link AbstractTextToSpeechFeature#play} or [resume]{@link AbstractTextToSpeechFeature#resume} are executed for a new speech. The speech that was interrupted is supplied as an argument to listener functions.
 * @property {string} [EVENTS.stop=onStopEvent] - Message that is emitted after each call to [stop]{@link AbstractTextToSpeechFeature#stop} and when a speech reaches the end of playback. The speech that was stopped is supplied as an argument to listener functions.
 * @property {string} [EVENTS.sentence=onSentenceEvent] - Message that is emitted each time a sentence speechmark is encountered whose timestamp matches up with the speech audio's current time. The sentence speechmark object is supplied as an argument to listener functions.
 * @property {string} [EVENTS.word=onWordEvent] - Message that is emitted each time a word speechmark is encountered whose timestamp matches up with the speech audio's current time. The word speechmark object is supplied as an argument to listener functions.
 * @property {string} [EVENTS.viseme=onVisemeEvent] - Message that is emitted each time a viseme speechmark is encountered whose timestamp matches up with the speech audio's current time. The viseme speechmark object is supplied as an argument to listener functions.
 * @property {string} [EVENTS.ssml=onSsmlEvent] - Message that is emitted each time a ssml speechmark is encountered whose timestamp matches up with the speech audio's current time. The ssml speechmark object is supplied as an argument to listener functions.
 *
 * @property {(number|undefined)} AWS_VERSION - Gets the version of AWS SDK being used. Will be undefined until [initializeService]{@link AbstractTextToSpeechFeature.initializeService} has been successfully executed.
 */
export class AbstractTextToSpeechFeature extends AbstractHostFeature {
  // export abstract class AbstractTextToSpeechFeature extends HostFeatureMixin(MixinBase) {
  public _speechCache: any;
  public _currentSpeech: any;
  private _currentPromise: any;
  public _isValidated: boolean;
  private _isGlobal: boolean;
  public _promises: any;
  public _volumePaused: any;
  private _voice: any;
  private _language: any;
  private _engine: any;
  private _audioFormat: string;
  private _sampleRate: any;
  private _speechmarkOffset: number;
  private _minEndMarkDuration: number;
  private _volume: number;

  // public static AWS_VERSION = '2.1048.0'; // awsVersion;
  // public static POLLY_MIN_NEURAL_VERSION = '2.1048.0';
  // public static POLLY_DEFAULTS = {
  //   Engine: 'standard',
  //   LexiconNames: [],
  //   OutputFormat: 'mp3',
  //   SampleRate: '22050',
  //   Text: '',
  //   TextType: 'ssml',
  //   VoiceId: 'Amy',
  //   LanguageCode: 'en-GB',
  //   LanguageName: 'British English',
  // };
  // public static POLLY_VOICES: any = [];
  // public static POLLY_LANGUAGES = {};
  // public static POLLY_LANGUAGE_CODES = {};
  // public static _isReady = false;
  // public static EVENTS = {
  //   ...Object.getPrototypeOf(AbstractTextToSpeechFeature).EVENTS,
  //   ready: 'onReadyEvent',
  //   play: 'onPlayEvent',
  //   pause: 'onPauseEvent',
  //   resume: 'onResumeEvent',
  //   interrupt: 'onInterruptEvent',
  //   stop: 'onStopEvent',
  //   sentence: 'onSentenceEvent',
  //   word: 'onWordEvent',
  //   viseme: 'onVisemeEvent',
  //   ssml: 'onSsmlEvent',
  // };
  // public static SERVICES = {
  //   ...Object.getPrototypeOf(AbstractTextToSpeechFeature).SERVICES,
  //   polly: undefined,
  //   presigner: undefined,
  // };

  /**
   * @constructor
   *
   * @param {HostObject} host - Host object managing the feature.
   * @param {Object=} options - Options that will be sent to Polly for each speech.
   * @param {string=} options.voice - The name of the Polly voice to use for all speech.
   * @param {string=} options.engine - The name of the Polly engine to use for all speech.
   * @param {string=} options.language - The name of the language to use for all speech.
   * @param {audioFormat} [options.audioFormat='mp3'] - The format to use for generated audio for all speeches.
   * @param {string=} options.sampleRate - The sample rate for audio files for all speeches.
   * @param {number} [options.speechmarkOffset=0] - Amount of time in seconds to offset speechmark event emission from the audio.
   * @param {number} [options.minEndMarkDuration=.05] - The minimum amount of time in seconds that the last speechmark of each type in a speech can have its duration property set to.
   * @param {number} [options.volume=1] - The default volume to play speech audio with.
   * @param {boolean} [options.isGlobal=false] - Whether the audio source should default to global regardless of whether or not it is attached to an object.
   */
  constructor(host?: HostObject, options: any = { voice: undefined, engine: undefined, language: undefined, audioFormat: 'mp3', sampleRate: undefined, speechmarkOffset: 0, minEndMarkDuration: 0.05, volume: 1, isGlobal: false });

  /**
   * Store Polly, Presigner and AWS SDK Version for use across all instances.
   *
   * @param {Polly} polly - Polly instance to use to generate speechmarks.
   * @param {Presigner} presigner - Presigner instance to use to generate audio URLs.
   * @param {string} version - Version of the AWS SDK to use to validate voice options.
   */
  static initializeService(polly: any, presigner: any, version: string): any;

  /**
   * Indicates whether or not the class is capable of generating speech audio. Polly, Presigner and AWS SDK version number must have been defined using [initializeService]{@link AbstractTextToSpeechFeature.initializeService}.
   *
   * @readonly
   * @type {boolean}
   */
  static get isReady(): boolean;

  /**
   * Get Is Global.
   *
   * @readonly
   * @type {boolean}
   */
  get isGlobal(): boolean;

  /**
   * Get the text of the currently playing speech.
   *
   * @readonly
   * @type {string}
   */
  get currentSpeech(): string; // string | null;

  /**
   * Get current Promise.
   *
   * @type {string}
   */
  get currentPromise(): any;

  /**
   * Set current Promise.
   *
   * @type {any}
   */
  set currentPromise(currentPromise: any);

  /**
   * Get the number of seconds to offset speechmark emission.
   *
   * @type {number}
   */
  get speechmarkOffset(): number;

  /**
   * Set the number of seconds to offset speechmark emission.
   *
   * @type {number}
   */
  set speechmarkOffset(offset: number);

  /**
   * Get the The minimum amount of time in seconds that the last speechmark of each type in a speech can have its duration property set to.
   *
   * @type number
   */
  get minEndMarkDuration(): number;

  /**
   * Set the The minimum amount of time in seconds that the last speechmark of each type in a speech can have its duration property set to.
   *
   * @type number
   */
  set minEndMarkDuration(duration: number);

  /**
   * Appends the Sumerian Hosts custom user-agent to a string if it is not already present.
   *
   * @private
   *
   * @param {string} currentUserAgent - String to append to if needed.
   *
   * @returns {string}
   */
  static _withCustomUserAgent(currentUserAgent: string | undefined): string;

  /**
   * Checks if a given engine type is compatible with the AWS SDK version. If it is, return the original value. Otherwise return a default.
   *
   * @private
   *
   * @param {string} engine - The type of Polly voice engine to validate.
   *
   * @returns {string}
   */
  _validateEngine(engine: string): string;

  /**
   * Checks if a given audio format type is compatible with Polly. If it is, return the original value. Otherwise return a default.
   *
   * @private
   *
   * @param {string} engine - The type of Polly voice engine to validate.
   *
   * @returns {string}
   */
  _validateFormat(format: any): string;

  /**
   * Checks if a given audio sampling rate is compatible with the current audio format. If it is, return the original value. Otherwise return a default.
   *
   * @private
   *
   * @param {string} engine - The type of Polly voice engine to validate.
   *
   * @returns {string}
   */
  _validateRate(rate: any): string;

  /**
   * Checks if a given Polly voice id is compatible with the current Polly engine. If it is, return the original value. Otherwise return a default.
   *
   * @private
   *
   * @param {string} engine - The type of Polly voice engine to validate.
   *
   * @returns {string}
   */
  _validateVoice(voiceId: any): string;

  /**
   * Checks if a given Polly language is compatible with the current Polly voice. If it is, return the original value. Otherwise return a default.
   *
   * @private
   *
   * @param {string} engine - The type of Polly voice engine to validate.
   *
   * @returns {string}
   */
  _validateLanguage(language: any): string;

  /**
   * Validate the current Polly options to make sure they are compatible with each other.
   *
   * @private
   */
  _validate();

  /**
   * Return an object containing parameters compatible with Polly.synthesizeSpeech.
   *
   * @private
   *
   * @returns {Object}
   */
  _getConfig(): any;

  /**
   * Update Polly parameters with options from a given config. All stored speeches will be updated to use the new parameters, unless the speech text is containeds in the 'skipSpeeches' parameter.
   *
   * @private
   *
   * @param {Object} config - Polly parameter options to overwrite.
   * @param {string[]} skipSpeeches - Text of any speeches that should not have parameters updated.
   *
   * @returns {Object}
   */
  _updateConfig(config?: any, skipSpeeches: string[] = []): any;

  /**
   * Update an existing speech, or add a new speech with new Polly parameters with options from a given config.
   *
   * @private
   *
   * @param {string} text - The text of the speech to update.
   * @param {Object} config - Polly parameter options to update.
   * @param {boolean} [force=false] - Whether to force the speech to be updated if no parameters have changes.
   *
   * @returns {AbstractSpeech}
   */
  _updateSpeech(text: string, config?: any, force: boolean = false): any;

  /**
   * Create a new Speech object for the speaker.
   *
   * @private
   *
   * @param {TextToSpeech} speaker - The TextToSpeech instance that will own the speech.
   * @param {string} text - Text of the speech.
   * @param {Object} speechmarks - Speechmarks for the speech.
   * @param {Object} audioConfig - Audio for the speech.
   *
   * @returns {AbstractSpeech}
   */
  _createSpeech(text: string, speechmarks: any, audioConfig?: any): any;

  /**
   * Create presigned URL of speech audio for the given speech text.
   *
   * @private
   *
   * @param {Object} params - Parameters object compatible with Polly.synthesizeSpeech.
   *
   * @returns {Deferred} Resolves with an object containing the audio URL.
   */
  _synthesizeAudio(params?: any): any; // Deferred | Promise<never>;

  /**
   * Retrieves and parses speechmarks for the given speech text.
   *
   * @private
   *
   * @param {Object} params - Parameters object compatible with Polly.synthesizeSpeech.
   *
   * @returns {Deferred} Resolves with an array of speechmark objects
   */
  _synthesizeSpeechmarks(params?: any): Deferred | Promise<any[]>;

  /**
   * Returns a Speech object that has the given text.
   *
   * @private
   *
   * @param {string} text - The text content of the Speech.
   * @param {Object=} config - Options to update the Speech with.
   *
   * @returns {Deferred} Resolves with Speech or null;
   */
  _getSpeech(text?: string, config?: any): any; // Deferred | Promise<never>;

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   *
   * @see TextToSpeechFeature
   * @returns {any} API
   */
  installApi(): any;

  /**
   * Get the volume used for all audio clips played by the speaker.
   *
   * @type {number}
   */
  set volume(volume: number);

  /**
   * Set the volume used for all audio clips played by the speaker.
   *
   * @type {number}
   */
  get volume(): number;

  /**
   * Get whether or not the speaker's volume value is currently being tweened.
   *
   * @readonly
   * @type {boolean}
   */
  get volumePending(): boolean;

  /**
   * Get the volume used for all audio clips played by the speaker.
   *
   * @returns {number}
   */
  getVolume(): number;

  /**
   * Updates the volume used for all audio clips played by the speaker over time.
   *
   * @param {number} volume - Target volume value.
   * @param {number} [seconds=0] - Amount of time it will take to reach the target volume.
   * @param {Function=} easingFn - Easing function used for interpolation.
   *
   * @returns {Deferred}
   */
  setVolume(volume: number, seconds: number = 0, easingFn?: any): any; // Deferred | Promise<never>;

  /**
   * Pause interpolation happening on the speaker's volume property.
   *
   * @returns {boolean}
   */
  pauseVolume(): boolean;

  /**
   * Resume any interpolation happening on the speaker's volume property.
   *
   * @returns {boolean}
   */
  resumeVolume(): boolean;

  /**
   * Update the currently playing speech.
   *
   * @param {number} deltaTime - Time since the last update.
   */
  update(deltaTime?: number);

  /**
   * Set the current speech to a new asset and update the speech's speechmark offset value to match that of the feature.
   *
   * @private
   *
   * @param {AbstractSpeech} speech - Speech to set as current.
   */
  _setCurrentSpeech(speech: AbstractSpeech);

  /**
   * Create a promise that will play/resume a speech with the given text after the audio context attempts to resume and speech audio is retrieved from Polly.
   *
   * @private
   *
   * @param {string} text - The text of the new speech to play.
   * @param {Object=} config - Optional parameters for the speech.
   * @param {string} [playMethod = 'play'] - Method to execute on the resulting Speech object. Valid options are 'play' and 'resume'.
   */
  _startSpeech(text?: string, config?: any, playMethod: string = 'play'): any; // Deferred | Promise<never>;

  /**
   * Stop any speeches currently playing and play a new speech from the beginning.
   *
   * @param {string} text - The text of the new speech to play.
   * @param {Object=} config - Optional parameters for the speech.
   *
   * @returns {Deferred}
   */
  play(text?: string, config?: any): any; // Deferred | Promise<never>;

  /**
   * If a speech is currently playing, pause it at the current time.
   */
  pause();

  /**
   * Stop any speeches currently playing and resume a new speech from the current time.
   *
   * @param {string=} text - The text of the new speech to play. If undefined and there is a current speech that is paused, the current speech will be resumed.
   * @param {Object=} config - Optional parameters for the speech.
   *
   * @returns {Deferred}
   */
  resume(text?: string, config?: any): any; // Deferred | Promise<never>;

  /**
   * If a speech is currently playing, stop playback and reset time.
   */
  stop();

  /**
   * If a speech is currently playing, discard playback and reset time.
   */
  discard();
}
