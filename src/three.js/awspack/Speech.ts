import {Audio, PositionalAudio} from 'three';
import {Speech as CoreSpeech} from '@core/awspack/Speech';
import {TextToSpeechFeature} from '@core/awspack/TextToSpeechFeature.js';

/**
 * Threejs Audio object
 * @external "THREE.Audio"
 * @see https://threejs.org/docs/#api/en/audio/Audio
 */

/**
 * Threejs PositionalAudio object
 * @external "THREE.PositionalAudio"
 * @see https://threejs.org/docs/#api/en/audio/PositionalAudio
 */

/**
 * @extends core/Speech
 * @alias three.js/Speech
 */
export class Speech extends CoreSpeech {
  /**
   * @constructor
   *
   * @param {TextToSpeechFeature} textToSpeech - The owner of the Speech that will emit speechmark messages.
   * @param {string} text - The text of the speech.
   * @param {Array.<Object>} speechmarks - An array of speechmark objects representing the text and timing of the speech.
   * @param {Object} audioConfig - Object containing audio and url.
   * @param {Audio} audioConfig.audio - Playable audio object.
   * @param {(Audio|PositionalAudios)} audioConfig.threeAudio - Three.js audio object.
   */
  constructor(textToSpeech: TextToSpeechFeature, text: string, speechmarks: any[] = [], audioConfig: any) {
    super(textToSpeech, text, speechmarks, audioConfig);
    this._audio = audioConfig.threeAudio;
  }

  /**
   * Get the Three.js audio object for the speech.
   *
   * @readonly
   * @type {(Audio|PositionalAudio)}
   */
  get audio(): Audio | PositionalAudio {
    return this._audio;
  }

  _pauseAudio() {
    this.audio.pause();
  }

  play(currentTime: any, onFinish: any, onError: any, onInterrupt: any) {
    // Re-connect the Audio element to stop playback
    this._audio.disconnect();
    this._audio.connect();
    return super.play(currentTime, onFinish, onError, onInterrupt);
  }
}
