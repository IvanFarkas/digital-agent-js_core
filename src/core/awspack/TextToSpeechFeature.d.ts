import { Speech } from '@core/awspack/Speech';
import { Deferred } from '@core/Deferred';
import { AbstractTextToSpeechFeature } from '@core/awspack/AbstractTextToSpeechFeature';

/**
 * @extends AbstractTextToSpeechFeature
 * @alias core/TextToSpeechFeature
 *
 * @property {boolean} _enabled - Enabled.
 * @property {Function} _audioContext - Audio Context.
 * @property {any} loop - Loop.
 */
export declare class TextToSpeechFeature extends AbstractTextToSpeechFeature {
  private _enabled: boolean;
  private _audioContext: any;
  public loop: any;

  /**
   * @constructor
   *
   * @param {any[]} [args=[]] - Args
   */
  constructor(...args: any[]);

  /**
   * Store the audio context that will be used to ensure audio can be played.
   *
   * @private
   */
  _setAudioContext();

  /**
   * Listen for state changes on the audio context to determine whether the feature is enabled.
   *
   * @private
   */
  _observeAudioContext();

  /**
   * Create an Audio object of speech audio for the given speech text.
   *
   * @private
   *
   * @param {Object} params - Parameters object compatible with Polly.synthesizeSpeech.
   *
   * @returns {Promise} Resolves with an object containing the audio URL and Audio object.
   */
  _synthesizeAudio(params: any): any; // Deferred | Promise<never>;

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
   * @returns {Speech}
   */
  _createSpeech(text: string, speechmarks: any, audioConfig: any): Speech;

  /**
   * Get whether or not the audio context is running and speech can be played.
   *
   * @readonly
   * @type {boolean}
   */
  get enabled(): boolean;

  /**
   * Set Audio Context.
   *
   * @type {boolean}
   */
  set audioContext(audioContext: any);

  /**
   * Try to resume the audio context. This will be automatically executed each time speech is played or resumed. If using manually, it should be called after a user interaction occurs.
   *
   * @returns {Deferred} - Resolves once the audio context has resumed.
   */
  resumeAudio(): Deferred;

  /**
   * Start the speech from the beginning.
   *
   * @param {string} text - Text.
   * @param {any} config - Config.
   * @param {string} [playMethod='play'] - Play Method.
   *
   * @returns {Deferred} Resolves once the speech reaches the end of playback.
   */
  _startSpeech(text: string, config: any, playMethod: string = 'play'): Deferred;

  /**
   * Play the speech from the beginning.
   *
   * @param {string} text - Text.
   * @param {any} config - Config.
   *
   * @returns {Deferred} Resolves once the speech reaches the end of playback.
   */
  play(text: string, config?: any): any; // Deferred | Promise<never>;

  /**
   * Resume the speech from the beginning.
   *
   * @param {string} text - Text.
   * @param {any} config - Config.
   *
   * @returns {Deferred} Resolves once the speech reaches the end of playback.
   */
  resume(text: string, config?: any): any; // Deferred | Promise<never>;

  /**
   * Adds a namespace to the host with the name of the feature to contain properties and methods from the feature that users of the host need access to.
   *
   * @returns {any} API
   */
  installApi(): any;
}
