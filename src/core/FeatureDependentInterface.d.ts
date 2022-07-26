import { HostObject } from '@core/HostObject';
import { Utils } from '@core/Utils';

/**
 * Class factory interface for features that are dependent on other features being present on the host. Event dependencies will be listened for when a feature of matching type is added to the host and will stop being listened for when one is removed. If the feature is already present when constructed, events will be listened for right away.
 *
 * @interface
 *
 * @property {HostObject} _host - The HostObject managing the feature.
 * @property {boolean} _initialized - Is it initialized.
 * @property {Object} EVENT_DEPENDENCIES - Events that the feature should start/stop listening for when a feature of type FeatureName is added/removed from the host. Event dependencies should follow the signature: { FeatureName: { eventName: callbackName, ... }, ... }
 */
export declare class FeatureDependentInterface {
  /**
   * Start listening for event dependencies that match the given feature type.
   *
   * @private
   *
   * @param {string} typeName - type of feature to listen for.
   */
  _onFeatureAdded(typeName: string);

  /**
   * Stop listening for event dependencies that match the given feature type.
   *
   * @private
   *
   * @param {string} typeName - type of feature to stop listening for.
   */
  _onFeatureRemoved(typeName: string);

  /**
   * @augments {@link AbstractHostFeature#discard}
   */
  discard();

  /**
   * Creates a class that implements {@link FeatureDependentInterface} and extends a specified base class.
   *
   * @param {Class} BaseClass - The class to extend.
   *
   * @return {Class} A class that extends `BaseClass` and implements {@link FeatureDependentInterface}.
   */
  static Mixin(BaseClass);
}
