import {EventDispatcher} from 'three';
import {Messenger as CoreMessenger} from '@core/Messenger';

/**
 * @extends core/Messenger
 * @alias three.js/Messenger
 *
 * @property {Messenger} _dispatcher - Optional clock to manage time.
 */
export class Messenger extends CoreMessenger {
  public static GlobalMessenger: any = new Messenger();

  static _initialize = (() => {
    // TODO: Verify
    // Assign Three.js EventDispatcher functionality to the Messenger class
    Object.getOwnPropertyNames(EventDispatcher.prototype)
      .filter((prop) => prop !== 'constructor')
      .forEach((prop: any) => {
        Messenger.prototype[prop] = EventDispatcher.prototype[prop];
      });
  })();

  /**
   * @constructor
   *
   * @param {any=} id - Id for the object. If none is provided a new id will be created. Id should be able to be represented as a string.
   */
  constructor(id?: any) {
    super(id);
    this.dispatcher = this;
  }

  _createEvent(message: any, value: any): any {
    return {detail: value, type: message};
  }
}
