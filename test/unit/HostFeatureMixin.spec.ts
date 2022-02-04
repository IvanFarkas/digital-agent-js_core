import {describeHostEnvironment} from './EnvironmentHarness';
import {HostFeatureMixin} from '@core/HostFeatureMixin';
import {MixinBase} from '@core/MixinBase';
import {Messenger} from '@app/Messenger';

describeHostEnvironment('HostFeatureMixin', (options = {}) => {
  let hostFeature: HostFeatureClass;
  let mockHost: any;

  class HostFeatureClass extends HostFeatureMixin(MixinBase) {}

  beforeEach(() => {
    hostFeature = new HostFeatureClass();
    mockHost = {
      // tslint:disable-next-line: no-string-literal
      owner: options['owner'],
      _features: {HostFeatureClass},
      _callbacks: {},
      listenTo: jest.fn(() => {}),
      stopListening: jest.fn(() => {}),
      stopListeningToAll: jest.fn(() => {}),
      emit: jest.fn(() => {}),
    };
    hostFeature._host = mockHost;
  });

  describe('installApi', () => {
    it('should add a property with the name of the feature class to the host set to an object that contains an EVENT property object', () => {
      hostFeature.installApi();

      expect(mockHost.HostFeatureClass).toBeDefined();
      expect(mockHost.HostFeatureClass.EVENTS).toBeDefined();

      const expected = 'object';
      const actual = typeof mockHost.HostFeatureClass.EVENTS;

      expect(expected).toEqual(actual);
    });
  });

  describe('host', () => {
    it('should return the object that owns the feature', () => {
      const expected = mockHost;
      const actual = hostFeature.host;

      expect(expected).toEqual(actual);
    });
  });

  describe('owner', () => {
    it('should return the object that owns the host that owns the feature', () => {
      // tslint:disable-next-line: no-string-literal
      const expected = options['owner'];
      const actual = hostFeature.owner;

      expect(expected).toEqual(actual);
    });
  });

  describe('listenTo', () => {
    it("should execute the host's listenTo method", () => {
      const hostFn = jest.spyOn(mockHost, 'listenTo');
      const listener = jest.fn(() => {});

      hostFeature.listenTo('message', listener);

      expect(hostFn).toHaveBeenCalledWith('message', listener);
    });
  });

  describe('stopListening', () => {
    it("should execute the host's stopListening method", () => {
      const hostFn = jest.spyOn(mockHost, 'stopListening');
      const listener = jest.fn(() => {});

      hostFeature.stopListening('message', listener);

      expect(hostFn).toHaveBeenCalledWith('message', listener);
    });
  });

  describe('stopListeningToAll', () => {
    it("should execute the host's stopListeningToAll method", () => {
      const hostFn = jest.spyOn(mockHost, 'stopListeningToAll');

      hostFeature.stopListeningToAll();

      expect(hostFn).toHaveBeenCalledWith();
    });
  });

  describe('emit', () => {
    it("should execute the host's emit method", () => {
      const hostFn = jest.spyOn(mockHost, 'emit');

      hostFeature.emit('message', 'value');

      expect(hostFn).toHaveBeenCalled();
      hostFn.mockRestore();
    });

    it("should prefix the emitted message with the name of the feature's class", () => {
      const hostFn = jest.spyOn(mockHost, 'emit');

      hostFeature.emit('message', 'value');

      expect(hostFn).toHaveBeenCalledWith('HostFeatureClass.message', 'value');
      hostFn.mockRestore();
    });
  });

  // TODO: Fix P2. "Messenger.emit()" is getting called with the right arguments. How to modify test to pass?
  describe('static emit', () => {
    it.skip("should execute Messenger's static emit method", () => {
      const messengerFn = jest.spyOn(Messenger, 'emit');

      HostFeatureClass.emit('message', 'value');

      expect(messengerFn).toHaveBeenCalled();
      messengerFn.mockReset();
    });

    it.skip("should prefix the emitted message with the name of the feature's class", () => {
      const messengerFn = jest.spyOn(Messenger, 'emit');

      HostFeatureClass.emit('message', 'value');

      expect(messengerFn).toHaveBeenCalledWith('HostFeatureClass.message', 'value');
      messengerFn.mockReset();
    });
  });

  describe('update', () => {
    it('should emit the update event with the value passed to update', () => {
      const emitSpy = jest.spyOn(hostFeature, 'emit');

      hostFeature.update(0.01);

      // TODO: How do I get HostFeatureClass out of HostFeatureMixin?
      expect(emitSpy).toHaveBeenCalledWith(HostFeatureClass.EVENTS.update, 0.01);
    });
  });

  describe('discard', () => {
    it("should delete the host's property reference to the feature", () => {
      hostFeature.installApi();

      expect(mockHost.HostFeatureClass).toBeDefined();

      hostFeature.discard();

      expect(mockHost.HostFeatureClass).not.toBeDefined();
    });

    it("should delete the feature's property reference to the host", () => {
      hostFeature.installApi();

      expect(hostFeature.host).toBeDefined();

      hostFeature.discard();

      expect(hostFeature._discarded).toBeTrue();
    });
  });

  // Note: New TS Mixin syntax. Bonus test.
  // describe('mix', () => {
  //   let MockInterface1;
  //   let MockInterface2;

  //   beforeAll(() => {
  //     MockInterface1 = class MockInterface1 {
  //       static Mixin(BaseClass) {
  //         return class extends BaseClass {};
  //       }
  //     };

  //     MockInterface2 = class MockInterface2 {
  //       static Mixin(BaseClass) {
  //         return class extends BaseClass {};
  //       }
  //     };
  //   });

  //   it('should execute each class factory in sequence', () => {
  //     const onMixin1 = jest.spyOn(MockInterface1, 'Mixin');
  //     const onMixin2 = jest.spyOn(MockInterface2, 'Mixin');

  //     HostFeatureMixin.mix(MockInterface1.Mixin, MockInterface2.Mixin);

  //     expect(onMixin1).toHaveBeenCalledBefore(onMixin2);
  //   });

  //   it('should return a class that inherits from HostFeatureMixin', () => {
  //     const MixClass = HostFeatureMixin.mix(MockInterface1.Mixin, MockInterface2.Mixin);

  //     expect(MixClass.prototype).toBeInstanceOf(HostFeatureMixin);
  //   });
  // });
});
