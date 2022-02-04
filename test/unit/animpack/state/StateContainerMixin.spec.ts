import 'jest-extended';
import {describeHostEnvironment} from '../../EnvironmentHarness';
import {StateContainerMixin} from '@core/animpack/state/StateContainerMixin';
import {MixinBase} from '@core/MixinBase';

describeHostEnvironment('StateContainerMixin', () => {
  let state1: any;
  let state2: any;
  let state3: any;
  let testContainer: TestContainerClass;
  const numberPattern = /\d+/g;

  class TestContainerClass extends StateContainerMixin(MixinBase) {}

  beforeEach(() => {
    state1 = {
      name: 'state1',
      discard: jest.fn().mockName('discard'),
    };
    state2 = {
      name: 'state2',
      discard: jest.fn().mockName('discard'),
    };
    state3 = {
      name: 'state2',
      discard: jest.fn().mockName('discard'),
    };

    testContainer = new TestContainerClass();
    testContainer.addState(state1);
    testContainer.addState(state2);
  });

  describe('getStateName', () => {
    it('should return an array of state names that the container controls', () => {
      const stateNames = testContainer.getStateNames();

      expect(stateNames.length).toEqual(2);
      expect(stateNames.includes('state1')).toBeTrue();
      expect(stateNames.includes('state2')).toBeTrue();
    });
  });

  describe('addState', () => {
    it('should execute a console warning if the state is already in the container', () => {
      const onWarn = jest.spyOn(console, 'warn');

      testContainer.addState(state1);
      expect(onWarn).toHaveBeenCalledTimes(1);
      onWarn.mockRestore();
    });

    it('should not add a new state if the state is already in the container', () => {
      const numStates = testContainer._states.size;

      testContainer.addState(state1);
      expect(testContainer._states.size).toEqual(numStates);
    });

    it('should execute a console warning if a state with the same name exists in the container', () => {
      const onWarn = jest.spyOn(console, 'warn');

      testContainer.addState(state3);
      expect(onWarn).toHaveBeenCalledTimes(1);
      onWarn.mockRestore();
    });

    it("should increment a new state's name if a state with the same name exists in the container", () => {
      const currentNameIndex: number = +state3.name.match(numberPattern)[0];

      testContainer.addState(state3);

      const newNameIndex: number = +state3.name.match(numberPattern)[0];

      expect(newNameIndex).toBeGreaterThan(currentNameIndex);
    });

    it('should store a new key in the _states map', () => {
      const numStates = testContainer._states.size;

      testContainer.addState(state3);
      expect(testContainer._states.size).toBeGreaterThan(numStates);
    });

    it('should return the name of the state', () => {
      const result = testContainer.addState(state3);

      expect(state3.name).toEqual(result);
    });
  });

  describe('removeState', () => {
    it('should execute a console warning if the state is not in the container', () => {
      const onWarn = jest.spyOn(console, 'warn');

      testContainer.removeState('NonState');
      expect(onWarn).toHaveBeenCalledTimes(1);
      onWarn.mockRestore();
    });

    it('should remove the state from the _states map', () => {
      testContainer.removeState('state1');
      expect(testContainer._states.has('state1')).toBeFalse();
    });
  });

  describe('renameState', () => {
    it('should throw an error if the state is not in the container', () => {
      expect(() => {
        testContainer.renameState('NotState', 'NewStateName');
      }).toThrowError();
    });

    it('should not change the name if newName is currentName', () => {
      const currentName = state1.name;

      expect(testContainer.renameState(state1.name, state1.name)).toEqual(currentName);
    });

    it('should execute a console warning if a state with the same newName exits in the container', () => {
      const onWarn = jest.spyOn(console, 'warn');

      testContainer.renameState('state1', 'state2');
      expect(onWarn).toHaveBeenCalledTimes(1);
      onWarn.mockRestore();
    });

    it("should increment a new state's name if a state with the same name exists in the container", () => {
      testContainer.renameState(state1.name, state2.name);

      const currentNameIndex: number = +state1.name.match(numberPattern)[0];
      const newNameIndex: number = +state2.name.match(numberPattern)[0];

      expect(currentNameIndex).toBeGreaterThan(newNameIndex);
    });

    it('should store the new state key and remove the old key', () => {
      const oldName = state1.name;
      const newName = 'newStateName';

      testContainer.renameState(oldName, newName);
      expect(testContainer._states.has(newName)).toBeTrue();
      expect(testContainer._states.has(oldName)).toBeFalse();
    });

    it('should not change the number of states in the container', () => {
      const numStates = testContainer._states.size;

      testContainer.renameState(state1.name, state2.name);
      expect(testContainer._states.size).toEqual(numStates);
    });

    it('should return the new name of the state', () => {
      const result = testContainer.renameState(state1.name, 'newStateName');

      expect(state1.name).toEqual(result);
    });
  });

  describe('discard', () => {
    it('should execute discard on all stored states', () => {
      testContainer.discardStates();
      expect(state1.discard).toHaveBeenCalledTimes(1);
      expect(state2.discard).toHaveBeenCalledTimes(1);
    });

    it('should remove all references to states', () => {
      expect(testContainer._states).toBeDefined();
      testContainer.discardStates();
      expect(testContainer._states.size).toEqual(0);
    });
  });
});
