/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
import { HostObject } from '../core/HostObject';

/**
 * Class factory interface for features that are dependent on other features being present on the host. Event dependencies will be listened for when a feature of matching type is added to the host and will stop being listened for when one is removed. If the feature is already present when constructed, events will be listened for right away.
 *
 * @interface
 *
 * @property {HostObject} _host - The HostObject managing the feature.
 * @property {boolean} _initialized - Is it initialized.
 * @property {Object} EVENT_DEPENDENCIES - Events that the feature should start/stop listening for when a feature of type FeatureName is added/removed from the host. Event dependencies should follow the signature: { FeatureName: { eventName: callbackName, ... }, ... }
 */
export class FeatureDependentInterface {
  /**
   * Start listening for event dependencies that match the given feature type.
   *
   * @private
   *
   * @param {string} typeName - type of feature to listen for.
   */
  _onFeatureAdded(typeName) {}

  /**
   * Stop listening for event dependencies that match the given feature type.
   *
   * @private
   *
   * @param {string} typeName - type of feature to stop listening for.
   */
  _onFeatureRemoved(typeName) {}

  /**
   * @augments {@link AbstractHostFeature#discard}
   */
  discard() {}

  /**
   * Creates a class that implements {@link FeatureDependentInterface} and extends a specified base class.
   *
   * @param {Class} BaseClass - The class to extend.
   *
   * @return {Class} A class that extends `BaseClass` and implements {@link FeatureDependentInterface}.
   */
  static Mixin(BaseClass) {
    const FeatureDependentMixin = class extends BaseClass {
      constructor(host) {
        super(host);
        this._host = host;

        // No need to listen for events if the mixin is in the prototype chain multiple times
        if (!this._initialized) {
          this._initialized = true;

          // Start listening for feature events
          this._onFeatureAdded = this._onFeatureAdded.bind(this);
          this._onFeatureRemoved = this._onFeatureRemoved.bind(this);

          this._host.listenTo(HostObject.EVENTS.addFeature, this._onFeatureAdded);
          this._host.listenTo(HostObject.EVENTS.removeFeature, this._onFeatureRemoved);

          const eventDependencies = this.constructor.EVENT_DEPENDENCIES;
          const eventDependencyKeys = Object.keys(eventDependencies);

          // Register features that already exist
          eventDependencyKeys.forEach((typeName, index, array) => {
            if (this._host[typeName] !== undefined) {
              this._onFeatureAdded(typeName);
            }
          });
        }
      }

      _onFeatureAdded(typeName) {
        const eventDependencies = this.constructor.EVENT_DEPENDENCIES[typeName];

        if (eventDependencies !== undefined) {
          const eventDependencyMap = Object.entries(eventDependencies);

          eventDependencyMap.forEach(([eventName, callback], index, array) => {
            this[callback] = this[callback].bind(this);
            const events = this._host[typeName].EVENTS[eventName];

            this._host.listenTo(events, this[callback]);
          });
        }
      }

      _onFeatureRemoved(typeName) {
        const eventDependencies = this.constructor.EVENT_DEPENDENCIES[typeName];

        if (eventDependencies !== undefined) {
          Object.entries(eventDependencies).forEach(([eventName, callback]) => {
            const events = this._host[typeName].EVENTS[eventName];

            this._host.stopListening(events, this[callback]);
          });
        }
      }

      discard(typeName) {
        const eventDependencies = this.constructor.EVENT_DEPENDENCIES[typeName];

        // Stop listening for feature events
        this._host.stopListening(HostObject.EVENTS.addFeature, this._onFeatureAdded);
        this._host.stopListening(HostObject.EVENTS.removeFeature, this._onFeatureRemoved);

        // Stop listening to feature-specific events
        Object.keys(eventDependencies).forEach((typeName) => {
          if (this._host[typeName] !== undefined) {
            this._onFeatureRemoved(typeName);
          }
        });

        super.discard();
      }
    };

    const EVENT_DEPENDENCIES = BaseClass.EVENT_DEPENDENCIES || {};

    // TODO: What do we do with this?
    Object.defineProperties(FeatureDependentMixin, {
      EVENT_DEPENDENCIES: {
        value: {
          ...EVENT_DEPENDENCIES,
        },
        writable: false,
      },
    });

    return FeatureDependentMixin;
  }
}

// TODO: What do we do with this?
/**
 * Event dependencies should follow the signature:
 * {
 *  FeatureName: {
 *    // Events that the feature should start/stop listening for when a feature
 *    // of type FeatureName is added/removed from the host
 *    {
 *      eventName: callbackName,
 *      ...
 *    },
 *  }
 * }
 */
Object.defineProperties(FeatureDependentInterface, {
  EVENT_DEPENDENCIES: {
    value: {},
    writable: false,
  },
});
