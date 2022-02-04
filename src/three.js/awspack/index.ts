// Fix circular dependency issues - https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de

import {TextToSpeechUtils} from '@core/awspack/TextToSpeechUtils';
import {TextToSpeechFeature} from '@core/awspack/TextToSpeechFeature';
import {Speech} from '@core/awspack/Speech';

/**
 * @module three/awspack
 */

export default {
  /**
   * @see three.js/TextToSpeechFeature
   */
  TextToSpeechFeature,
  /**
   * @see core/TextToSpeechUtils
   */
  TextToSpeechUtils,
  /**
   * @see three.js/Speech
   */
  Speech,
};
