import {describeHostEnvironment} from './EnvironmentHarness';
import {HostFeatureMixin} from '@core/HostFeatureMixin';
import {Deferred} from '@core/Deferred';
import {MixinBase} from '@core/MixinBase';
import {HostObject} from '@app/HostObject';

describeHostEnvironment('HostObject', (options = {}) => {
  let host: HostObject;

  class HostFeatureClass extends HostFeatureMixin(MixinBase) {}

  beforeEach(() => {
    host = new HostObject(options);
  });

  describe('id', () => {
    it("should return the owner's id", () => {
      const actual = host.id;
      const expected = host.owner.id;

      expect(actual).toEqual(expected);
    });
  });

  describe('now', () => {
    it('should return a number greater than zero', () => {
      const {now} = host;

      expect(now).toBeGreaterThan(0);
    });
  });

  describe('deltaTime', () => {
    it('should return the number of milliseconds since the last time update was called', (done) => {
      host.update();

      setTimeout(() => {
        expect(host.deltaTime / 1000).toBeCloseTo(0.1, 0);
        done();
      }, 100);
    });
  });

  describe('wait', () => {
    it('should return a Deferred promise', () => {
      expect(host.wait(3)).toBeInstanceOf(Deferred);
    });

    // Note: Test case is mute since TS compiler reports type mismatch
    // it('should log a warning if the seconds argument is not a number', () => {
    //   const onWarn = jest.spyOn(console, 'warn');
    //   host.wait('notANumber');

    //   expect(onWarn).toHaveBeenCalledTimes(1);
    // });

    it('should add a new deferred to the _waits array', () => {
      const currentWaits = host._waits.length;
      host.wait(3);

      expect(host._waits.length).toBeGreaterThan(currentWaits);
    });

    it('should resolve immediately if the seconds argument is less than or equal to zero', async () => {
      await expect(host.wait(0)).toResolve();

      await expect(host.wait(-1)).toResolve();
    });

    it("should execute the deferred's execute method with delta time when update is executed", () => {
      const wait = host.wait(3) as Deferred;
      const onExecute = jest.spyOn(wait, 'execute');
      const {deltaTime} = host;

      host.update();

      expect(onExecute).toHaveBeenCalledWith(deltaTime);
      onExecute.mockRestore();
    });

    it('should remove the deferred from the _waits array once the deferred is no longer pending', () => {
      const wait = host.wait(0.001) as Deferred;

      expect(host._waits.includes(wait)).toBeTrue();

      wait.resolve();

      wait.then(() => {
        expect(host._waits.includes(wait)).toBeFalse();
      });
    });
  });

  describe('update', () => {
    it('should emit the update event', () => {
      const promise = new Promise<void>((resolve: any) => {
        host.listenTo(HostObject.EVENTS.update, () => {
          resolve();
        });
      });

      host.update();

      return expect(promise).toResolve();
    });
  });

  describe('addFeature', () => {
    it('feature type should only accept type function', () => {
      expect(host.addFeature.bind(host, 'NotAFeature')).toThrowError();
    });

    it('should only accept feature types inheriting from HostFeatureMixin', () => {
      expect(host.addFeature.bind(host, HostFeatureMixin)).toThrowError();
    });

    it('should emit the addFeature event with the name of the feature that has been added', async () => {
      const promise = new Promise((resolve) => {
        host.listenTo(HostObject.EVENTS.addFeature, (featureName) => {
          resolve(featureName);
        });
      });

      host.addFeature(HostFeatureClass);

      // await expect(promise).toBeResolvedTo('HostFeatureClass');
      await expect(promise).toResolve();
      await expect(promise).resolves.toEqual('HostFeatureClass');
    });

    it('should only add a feature type that already exists if force argument is true', () => {
      host.addFeature(HostFeatureClass);

      expect(host.addFeature.bind(host, HostFeatureClass)).toThrowError();
      expect(host.addFeature.bind(host, HostFeatureClass, true)).not.toThrowError();
    });
  });

  describe('hasFeature', () => {
    it('should return true if the host owns a feature with the given name', () => {
      host.addFeature(HostFeatureClass);

      expect(host.hasFeature('HostFeatureClass')).toBeTrue();
    });

    it('should return false if the host does not own a feature with the given name', () => {
      expect(host.hasFeature('SomeOtherHostFeature')).toBeFalse();
    });
  });

  describe('listFeatures', () => {
    it('should return an array of the names of installed features', () => {
      host.addFeature(HostFeatureClass);

      expect(host.listFeatures()).toContain('HostFeatureClass');
    });
  });

  describe('removeFeature', () => {
    it('should return false if no feature with the given name was installed', () => {
      expect(host.removeFeature('SomeOtherHostFeature')).toBeFalse();
    });

    it('should return true if a feature is successfully uninstalled', () => {
      host.addFeature(HostFeatureClass);

      expect(host.removeFeature('HostFeatureClass')).toBeTrue();
    });

    it('should emit the removeFeature event with the name of the feature that has been removed', async () => {
      host.addFeature(HostFeatureClass);

      const promise = new Promise((resolve) => {
        host.listenTo(HostObject.EVENTS.removeFeature, (featureName) => {
          resolve(featureName);
        });
      });

      host.removeFeature('HostFeatureClass');

      // await expect(promise).toBeResolvedTo('HostFeatureClass');
      await expect(promise).toResolve();
      await expect(promise).resolves.toEqual('HostFeatureClass');
    });
  });
});
