import {AbstractSpeech} from '@core/awspack/AbstractSpeech';

/**
 * The built-in class for asynchronous Promises.
 * @external Audio
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
 */

/**
 * @extends AbstractSpeech
 * @alias core/Speech
 *
 * @property {any} _audio - Audio.
 * @property {boolean} _audioFinished - Is audio Finished.
 */
export class Speech extends AbstractSpeech {
  // TODO: Make private, add getters
  public _audio: any;
  private _audioFinished: boolean;

  /**
   * @constructor
   *
   * @param {TextToSpeechFeature} speaker - The owner of the Speech that will emit speechmark messages.
   * @param {string} text - The text of the speech.
   * @param {Array.<Object>} [speechmarks=[]] - An array of speechmark objects representing the text and timing of the speech.
   * @param {Object} audioConfig - Object containing audio and url.
   * @param {Audio} audioConfig.audio - Playable audio object.
   */
  constructor(speaker: any, text: string, speechmarks: any[] = [], audioConfig: any);

  /**
   * Return whether or not the speech has reached it's end.
   *
   * @private
   *
   * @returns {boolean}
   */
  _checkFinished(): boolean;

  /**
   * Get the playable audio for the speech.
   *
   * @readonly
   * @type {Audio}
   */
  get audio(): any;

  /**
   * Get the audio volume for the speech.
   *
   * @type {number}
   */
  get volume(): number;

  /**
   * Set the audio volume for the speech.
   */
  set volume(volume: number);

  /**
   * Set the audio's current local time and play it.
   *
   * @private
   */
  _playAudio();

  /**
   * Pause the audio once it is playable.
   *
   * @private
   */
  _pauseAudio();

  /**
   * Play the speech from the beginning.
   *
   * @param {number} currentTime - Current global time when play was called.
   * @param {Function=} onFinish - Optional function to execute once the speech promise resolves.
   * @param {Function=} onError - Optional function to execute if the speech encounters and error during playback.
   * @param {Function=} onInterrupt - Optional function to execute if the speech is canceled.
   *
   * @returns {Deferred} Resolves once the speech reaches the end of playback.
   */
  play(currentTime?: number, onFinish?: any, onError?: any, onInterrupt?: any): any;

  /**
   * Pause the speech at the current time.
   *
   * @param {number} currentTime - Current global time when pause was called.
   */
  pause(currentTime?: number);

  /**
   * Resume the speech at the current time.
   *
   * @param {number} currentTime - Current global time when resume was called.
   * @param {Function=} onFinish - Optional function to execute once the speech promise resolves.
   * @param {Function=} onError - Optional function to execute if the speech encounters and error during playback.
   * @param {Function=} onInterrupt - Optional function to execute if the speech is canceled.
   *
   * @returns {Deferred} Resolves once the speech reaches the end of playback.
   */
  resume(currentTime?: number, onFinish?: any, onError?: any, onInterrupt?: any): any;

  /**
   * Cancels playback of the speech at the current time. Cancel the speech promise.
   */
  cancel();

  /**
   * Stop the speech and reset time to the beginning. Resolve the speech promise.
   */
  stop();
}
