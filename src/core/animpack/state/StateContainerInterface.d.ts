import {AbstractState} from '@core/animpack/state/AbstractState';
import {Utils} from '@core/Utils';

/**
 * Class factory interface for manipulating a collection of {@link AbstractState}.
 *
 * @interface
 *
 * @property {AbstractState[]} _states - _states.
 * @property {string} name - Name of the state.
 */
export declare class StateContainerInterface {
  /**
   * Return the state with the given name.
   *
   * @param {string} name - Name of the state.
   *
   * @returns {AbstractState}
   */
  getState(name: string);

  /**
   * Gets an array of the names of all states in the container.
   *
   * @type {string[]}
   */
  getStateNames();

  /**
   * Add a new state to be controlled by the container. States are stored keyed by their name property, which must be unique. If it isn't, a number will be added or incremented until a unique key is generated.
   *
   * @param {AbstractState} state - State to add to the container.
   *
   * @returns {string} - Unique name of the state.
   */
  addState(state: any);

  /**
   * Removes a state with the given name from the container.
   *
   * @param {string} name - Name of the state to remove.
   *
   * @returns {boolean} - Whether or not a state was removed.
   */
  removeState(name: string);

  /**
   * Renames a state with the given name in the container. Name must be unique to the container, if it isn't the name will be incremented until it is unique.
   *
   * @param {string} currentName - Name of the state to rename.
   * @param {string} newName - Name to update the state with.
   *
   * @returns {string} - Updated name for the state.
   */
  renameState(currentName: string, newName: string);

  /**
   * Discards all states.
   */
  discardStates();

  /**
   * Creates a class that implements {@link StateContainerInterface} and extends a specified base class.
   *
   * @param {Class} [BaseClass = class{}] - The class to extend.
   *
   * @return {Class} A class that extends `BaseClass` and implements {@link StateContainerInterface}.
   */
  static Mixin(BaseClass = class {});
}
