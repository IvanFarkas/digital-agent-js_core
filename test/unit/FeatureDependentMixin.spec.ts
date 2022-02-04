import {describeHostEnvironment} from './EnvironmentHarness';
import {FeatureDependentMixin} from '@core/FeatureDependentMixin';
import {HostFeatureMixin} from '@core/HostFeatureMixin';
import {HostObject} from '@core/HostObject';
import {MixinBase} from '@core/MixinBase';

describeHostEnvironment('FeatureDependentMixin', () => {
  let hostFeature: any; // Feature Class
  let MockHostFeature1: any; // Feature Class
  let MockHostFeature2: any; // Feature Class
  let host: HostObject;

  beforeEach(() => {
    const FeatureDependentClass = FeatureDependentMixin(HostFeatureMixin(MixinBase));

    // tslint:disable-next-line: no-string-literal
    FeatureDependentClass.prototype['dependency1'] = jest.fn().mockName('dependency1');

    // tslint:disable-next-line: no-string-literal
    FeatureDependentClass.prototype['dependency2'] = jest.fn().mockName('dependency2');

    FeatureDependentClass.EVENT_DEPENDENCIES.MockHostFeature1 = {
      dependency1Event: 'dependency1',
      dependency2Event: 'dependency2',
    };
    MockHostFeature1 = class MockHostFeature1 extends HostFeatureMixin(MixinBase) {};
    Object.assign(MockHostFeature1.EVENTS, {
      dependency1Event: 'dependency1',
      dependency2Event: 'dependency2',
    });
    MockHostFeature2 = class MockHostFeature2 extends HostFeatureMixin(MixinBase) {};
    host = new HostObject();
    host.addFeature(FeatureDependentClass);
    host.addFeature(MockHostFeature1);
    host.addFeature(MockHostFeature2);
    hostFeature = host._features.get('FeatureDependentClass'); // FeatureDependentMixin
  });

  describe('_onFeatureAdded', () => {
    it("should add listeners for any EVENT_DEPENDENCIES that match the added feature's name", () => {
      const listenTo = jest.spyOn(host, 'listenTo');

      hostFeature._onFeatureAdded('MockHostFeature1');

      expect(listenTo).toHaveBeenCalledWith('MockHostFeature1.dependency1', hostFeature.dependency1);

      expect(listenTo).toHaveBeenCalledWith('MockHostFeature1.dependency2', hostFeature.dependency2);
    });

    it("should not add listeners for any EVENT_DEPENDENCIES that do not match the added feature's name", () => {
      const listenTo = jest.spyOn(host, 'listenTo');

      hostFeature._onFeatureAdded('MockHostFeature2');

      expect(listenTo).not.toHaveBeenCalledWith('MockHostFeature1.dependency1', hostFeature.dependency1);

      expect(listenTo).not.toHaveBeenCalledWith('MockHostFeature1.dependency2', hostFeature.dependency2);
    });
  });

  describe('_onFeatureRemoved', () => {
    it("should remove listeners for any EVENT_DEPENDENCIES that match the removed feature's name", () => {
      const stopListening = jest.spyOn(host, 'stopListening');

      hostFeature._onFeatureRemoved('MockHostFeature1');

      expect(stopListening).toHaveBeenCalledWith('MockHostFeature1.dependency1', hostFeature.dependency1);

      expect(stopListening).toHaveBeenCalledWith('MockHostFeature1.dependency2', hostFeature.dependency2);
    });

    it("should not remove listeners for any EVENT_DEPENDENCIES that do not match the removed feature's name", () => {
      const stopListening = jest.spyOn(host, 'stopListening');

      hostFeature._onFeatureRemoved('MockHostFeature2');

      expect(stopListening).not.toHaveBeenCalledWith('MockHostFeature1.dependency1', hostFeature.dependency1);

      expect(stopListening).not.toHaveBeenCalledWith('MockHostFeature1.dependency2', hostFeature.dependency2);
    });
  });

  describe('discard', () => {
    it('should remove listeners for all event dependencies', () => {
      const stopListening = jest.spyOn(host, 'stopListening');

      hostFeature.discard();

      expect(stopListening).toHaveBeenCalledWith('MockHostFeature1.dependency1', hostFeature.dependency1);

      expect(stopListening).toHaveBeenCalledWith('MockHostFeature1.dependency2', hostFeature.dependency2);
    });
  });
});
