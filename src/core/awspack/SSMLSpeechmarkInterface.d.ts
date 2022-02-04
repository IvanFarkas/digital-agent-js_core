/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-empty */
import {TextToSpeechFeatureDependentInterface} from '@core/awspack/TextToSpeechFeatureDependentInterface';

/**
 * Class factory interface for that registers callback method when a ssml speechmark event is emitted.
 *
 * @interface
 * @extends TextToSpeechFeatureDependentInterface
 *
 */
export class SSMLSpeechmarkInterface extends TextToSpeechFeatureDependentInterface {
  /**
   * When ssml events are caught, this will try to parse the speech mark value and execute any function which meets criteria defined in the value. Speech mark value will be treated as stringified json format containing required feature name, function name and argument array to pass in. Example speech mark value might look like: '{"feature":"GestureFeature", "method":"switchToGesture", "args":["genricA", 0.5]}'
   *
   * @private
   *
   * @param {Object} event - Event data passed from the speech.
   * @param {Object} event.mark - Speechmark object.
   */
  _onSsml({mark}: {mark: any});

  /**
   * Creates a class that implements {@link SSMLSpeechmarkInterface} and extends a specified base class.
   *
   * @param {Class} BaseClass - The class to extend.
   *
   * @return {Class} A class that extends `BaseClass` and implements {@link SSMLSpeechmarkInterface}.
   */
  static Mixin(BaseClass);
}
