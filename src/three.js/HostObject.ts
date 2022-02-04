/**
 * Threejs Clock object
 *
 * @external "Clock"
 * @see https://threejs.org/docs/#api/en/core/Clock
 */
import {Group, Clock} from 'three';
import {HostObject as CoreHostObject} from '@core/HostObject';
import {Utils} from '@core/Utils';

/**
 * @alias three.js/HostObject
 * @extends core/HostObject
 *
 * @property {Clock} _clock - Optional THREE clock to manage time.
 */
export class HostObject extends CoreHostObject {
  private _clock: Clock;

  /**
   * @constructor
   *
   * @param {Object=} options - Options for the host.
   * @param {Object=} options.owner - Optional engine-specific owner of the host.
   * @param {Clock=} options.clock - Optional clock to manage time.
   */
  constructor(options: any = {}) {
    // TODO: Is there a better way to get thse values?
    const owner = Utils.getObjectValue(options, 'owner') as object;
    const clock = Utils.getObjectValue(options, 'clock') as Clock;
    const character = Utils.getObjectValue(owner, 'character') as Group;

    super(options);

    this._clock = clock;
    if (this._clock) {
      Object.defineProperty(this, 'now', {
        get: () => {
          return this._clock.getElapsedTime() * 1000;
        },
      });
      this._lastUpdate = this.now;
    }
  }
}
