import {describeHostEnvironment} from '../EnvironmentHarness';
import {Deferred} from '@core/Deferred';
import {HostFeatureMixin} from '@core/HostFeatureMixin';
import {ManagedAnimationLayerMixin} from '@core/animpack/ManagedAnimationLayerMixin';
import {HostObject} from '@core/HostObject';
import {MixinBase} from '@core/MixinBase';

describeHostEnvironment('ManagedAnimationLayerMixin', () => {
  let managedLayerFeature: any;
  let mockAnimationFeature: any;
  let host: HostObject;

  beforeEach(() => {
    host = new HostObject();
    const HostFeature = ManagedAnimationLayerMixin(HostFeatureMixin(MixinBase));
    host.addFeature(HostFeature);

    // managedLayerFeature = host._features.ManagedAnimationLayerMixin;
    managedLayerFeature = host.getFeature('ManagedAnimationLayerClass');

    mockAnimationFeature = {
      layers: ['layer1', 'layer2'],
      getAnimations: jest.fn().mockName('getAnimations'),
      setLayerWeight: jest.fn().mockName('setLayerWeight'),
      addLayer: jest.fn(() => {}).mockName('addLayer'),
      removeLayer: jest.fn(() => {}).mockName('removeLayer'),
      renameLayer: jest.fn(() => {}).mockName('renameLayer'),
      addAnimation: jest.fn(() => {}).mockName('addAnimation'),
      removeAnimation: jest.fn(() => {}).mockName('removeAnimation'),
      renameAnimation: jest.fn(() => {}).mockName('renameAnimation'),
      EVENTS: {
        addLayer: 'AnimationFeature.onAddLayerEvent',
        removeLayer: 'AnimationFeature.onRemoveLayerEvent',
        renameLayer: 'AnimationFeature.onRenameLayerEvent',
        addAnimation: 'AnimationFeature.onAddAnimationEvent',
        removeAnimation: 'AnimationFeature.onRemovedAnimationEvent',
        renameAnimation: 'AnimationFeature.onRenameAnimationEvent',
      },
    };
    mockAnimationFeature.getAnimations = jest.fn(() => ['anim1', 'anim2']);

    // TODO: What's the difference between host.AnimationFeature and host._features.AnimationFeature? Why need both?
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    host.AnimationFeature = mockAnimationFeature;
    //host._features.AnimationFeature = mockAnimationFeature;
    host.setFeature('AnimationFeature', mockAnimationFeature);
  });

  describe('_onFeatureAdded', () => {
    let onLayerAdded: any;

    beforeEach(() => {
      onLayerAdded = jest.spyOn(managedLayerFeature, '_onLayerAdded');
    });

    it('should should execute _onLayerAdded for each layer name on the new feature if the added feature is an animation feature', () => {
      managedLayerFeature._onFeatureAdded('AnimationFeature');

      mockAnimationFeature.layers.forEach((name: string) => {
        expect(onLayerAdded).toHaveBeenCalledWith({name});
      });
      onLayerAdded.mockRestore();
    });

    it('should not execute _onLayerAdded if the added feature is not an animation feature', () => {
      managedLayerFeature._onFeatureAdded('NotAnAnimationFeature');

      expect(onLayerAdded).not.toHaveBeenCalled();
      onLayerAdded.mockRestore();
    });

    it('should not execute _onLayerAdded if the added feature is an animation feature but has no layers', () => {
      mockAnimationFeature.layers = [];
      managedLayerFeature._onFeatureAdded('AnimationFeature');

      expect(onLayerAdded).not.toHaveBeenCalled();
      onLayerAdded.mockRestore();
    });
  });

  describe('_onFeatureRemoved', () => {
    let onLayerRemoved: any;

    beforeEach(() => {
      onLayerRemoved = jest.spyOn(managedLayerFeature, '_onLayerRemoved');
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
      };
    });

    it('should should execute _onLayerRemoved for each layer name on the new feature if the removed feature is an animation feature', () => {
      managedLayerFeature._onFeatureRemoved('AnimationFeature');

      mockAnimationFeature.layers.forEach((name: string) => {
        expect(onLayerRemoved).toHaveBeenCalledWith({name});
      });
      onLayerRemoved.mockRestore();
    });

    it('should not execute _onLayerRemoved if the removed feature is not an animation feature', () => {
      managedLayerFeature._onFeatureRemoved('NotAnAnimationFeature');

      expect(onLayerRemoved).not.toHaveBeenCalled();
      onLayerRemoved.mockRestore();
    });

    it('should not execute _onLayerRemoved if there are no managed layers', () => {
      managedLayerFeature._managedLayers = {};
      managedLayerFeature._onFeatureRemoved('AnimationFeature');

      expect(onLayerRemoved).not.toHaveBeenCalled();
      onLayerRemoved.mockRestore();
    });
  });

  describe('_onLayerAdded', () => {
    let onAnimationAdded: any;

    beforeEach(() => {
      onAnimationAdded = jest.spyOn(managedLayerFeature, '_onAnimationAdded');
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: false,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
        layer2: {
          isActive: false,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
      };
    });

    it('should set isActive to true for any managed layers that match the name of the added layer', () => {
      expect(managedLayerFeature._managedLayers.layer1.isActive).toBeFalse();
      expect(managedLayerFeature._managedLayers.layer2.isActive).toBeFalse();

      managedLayerFeature._onLayerAdded({name: 'layer1'});

      expect(managedLayerFeature._managedLayers.layer1.isActive).toBeTrue();
      expect(managedLayerFeature._managedLayers.layer2.isActive).toBeFalse();
    });

    it('should execute _onAnimationAdded for any managed animations on the managed layer that matches the name of the added layer', () => {
      managedLayerFeature._onLayerAdded({name: 'layer1'});

      Object.keys(managedLayerFeature._managedLayers.layer1.animations).forEach((name: string) => {
        expect(onAnimationAdded).toHaveBeenCalledWith({
          layerName: 'layer1',
          animationName: name,
        });
      });

      Object.keys(managedLayerFeature._managedLayers.layer2.animations).forEach((name: string) => {
        expect(onAnimationAdded).not.toHaveBeenCalledWith({
          layerName: 'layer2',
          animationName: name,
        });
      });
      onAnimationAdded.mockRestore();
    });

    it('should not make any changes to _managedLayers if there is no managed layer matching the name of the added layer', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};
      managedLayerFeature._onLayerAdded({name: 'layer3'});

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });

    it('should not execute _onAnimationAdded if there is no managed layer matching the name of the added layer', () => {
      managedLayerFeature._onLayerAdded({name: 'layer3'});

      expect(onAnimationAdded).not.toHaveBeenCalled();
      onAnimationAdded.mockRestore();
    });
  });

  describe('_onLayerRemoved', () => {
    let onAnimationRemoved: any;

    beforeEach(() => {
      onAnimationRemoved = jest.spyOn(managedLayerFeature, '_onAnimationRemoved');
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
      };
    });

    it('should set isActive to false for any managed layers that match the name of the removed layer', () => {
      expect(managedLayerFeature._managedLayers.layer1.isActive).toBeTrue();
      expect(managedLayerFeature._managedLayers.layer2.isActive).toBeTrue();

      managedLayerFeature._onLayerRemoved({name: 'layer1'});

      expect(managedLayerFeature._managedLayers.layer1.isActive).toBeFalse();
      expect(managedLayerFeature._managedLayers.layer2.isActive).toBeTrue();
    });

    it('should execute _onAnimationRemoved for any managed animations on the managed layer that matches the name of the removed layer', () => {
      managedLayerFeature._onLayerRemoved({name: 'layer1'});

      Object.keys(managedLayerFeature._managedLayers.layer1.animations).forEach((name: string) => {
        expect(onAnimationRemoved).toHaveBeenCalledWith({
          layerName: 'layer1',
          animationName: name,
        });
      });

      Object.keys(managedLayerFeature._managedLayers.layer2.animations).forEach((name: string) => {
        expect(onAnimationRemoved).not.toHaveBeenCalledWith({
          layerName: 'layer2',
          animationName: name,
        });
      });
      onAnimationRemoved.mockRestore();
    });

    it('should not make any changes to _managedLayers if there is no managed layer matching the name of the removed layer', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};

      managedLayerFeature._onLayerRemoved({name: 'layer3'});

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });

    it('should not execute _onAnimationRemoved if there is no managed layer matching the name of the removed layer', () => {
      managedLayerFeature._onLayerRemoved({name: 'layer3'});

      expect(onAnimationRemoved).not.toHaveBeenCalled();
      onAnimationRemoved.mockRestore();
    });
  });

  describe('_onLayerRenamed', () => {
    beforeEach(() => {
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
      };
    });

    it('should remove the key whose name matches oldName and insert its value at a new key with newName on _managedLayers', () => {
      const layer1Options = managedLayerFeature._managedLayers.layer1;

      expect(managedLayerFeature._managedLayers.layer3).not.toBeDefined();

      managedLayerFeature._onLayerRenamed({
        oldName: 'layer1',
        newName: 'layer3',
      });

      expect(managedLayerFeature._managedLayers.layer1).not.toBeDefined();
      expect(managedLayerFeature._managedLayers.layer3).toEqual(layer1Options);
    });

    it('should not make changes to _managedLayers if there is no managed layer matching oldName', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};

      managedLayerFeature._onLayerRenamed({
        oldName: 'layer3',
        newName: 'layer4',
      });

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });
  });

  describe('_onAnimationAdded', () => {
    beforeEach(() => {
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
      };
    });

    it('should set isActive to true for any managed animations that match the name of the added animation and layer', () => {
      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.isActive).toBeFalse();

      expect(managedLayerFeature._managedLayers.layer2.animations.anim1.isActive).toBeFalse();

      managedLayerFeature._onAnimationAdded({
        layerName: 'layer1',
        animationName: 'anim1',
      });

      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.isActive).toBeTrue();

      expect(managedLayerFeature._managedLayers.layer2.animations.anim1.isActive).toBeFalse();
    });

    it('should not make any changes to _managedLayers if there is no managed animation matching the name of the added animation and layer', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};

      managedLayerFeature._onAnimationAdded({
        layerName: 'layer3',
        animationName: 'anim1',
      });

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });
  });

  describe('_onAnimationRemoved', () => {
    beforeEach(() => {
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
      };
    });

    it('should set isActive to false for any managed animations that match the name of the removed animation and layer', () => {
      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.isActive).toBeTrue();

      expect(managedLayerFeature._managedLayers.layer2.animations.anim1.isActive).toBeTrue();

      managedLayerFeature._onAnimationRemoved({
        layerName: 'layer1',
        animationName: 'anim1',
      });

      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.isActive).toBeFalse();

      expect(managedLayerFeature._managedLayers.layer2.animations.anim1.isActive).toBeTrue();
    });

    it('should not make any changes to _managedLayers if there is no managed animation matching the name of the removed animation and layer', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};

      managedLayerFeature._onAnimationRemoved({
        layerName: 'layer3',
        animationName: 'anim1',
      });

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });
  });

  describe('_onAnimationRenamed', () => {
    beforeEach(() => {
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: true}, anim2: {isActive: true}},
        },
      };
    });

    it('should remove the key whose name matches oldName and insert its value at a new key with newName on the managed layer whose name matches layerName', () => {
      const layer1Anim1Options = managedLayerFeature._managedLayers.layer1.animations.anim1;

      expect(managedLayerFeature._managedLayers.layer1.animations.anim3).not.toBeDefined();

      managedLayerFeature._onAnimationRenamed({
        layerName: 'layer1',
        oldName: 'anim1',
        newName: 'anim3',
      });

      expect(managedLayerFeature._managedLayers.layer1.animations.anim1).not.toBeDefined();

      expect(managedLayerFeature._managedLayers.layer1.animations.anim3).toEqual(layer1Anim1Options);
    });

    it('should not make changes to _managedLayers if there is no managed layer matching layerName', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};

      managedLayerFeature._onAnimationRenamed({
        layerName: 'layer3',
        oldName: 'anim1',
        newName: 'anim3',
      });

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });

    it('should not make changes to _managedLayers if there is no managed animation matching oldName', () => {
      const managedLayers = {...managedLayerFeature._managedLayers};

      managedLayerFeature._onAnimationRenamed({
        layerName: 'layer3',
        oldName: 'anim3',
        newName: 'anim4',
      });

      expect(managedLayers).toEqual(managedLayerFeature._managedLayers);
    });
  });

  describe('registerLayer', () => {
    let onRegisterAnimation: any;

    beforeEach(() => {
      onRegisterAnimation = jest.spyOn(managedLayerFeature, 'registerAnimation');
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: false,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
        layer2: {
          isActive: false,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
      };
    });

    it('should add a new key to _managedLayers if one with the given name does not already exist', () => {
      expect(managedLayerFeature._managedLayers.layer3).not.toBeDefined();

      managedLayerFeature.registerLayer('layer3');

      expect(managedLayerFeature._managedLayers.layer3).toBeDefined();
    });

    it('should assign DEFAULT_LAYER_OPTIONS to the managed layer the layer was not previously managed', () => {
      managedLayerFeature.registerLayer('layer3');

      const layerOptions = managedLayerFeature._managedLayers.layer3;

      // TODO: How do I export the class definition from a mixin?
      // Object.entries(ManagedAnimationLayer.DEFAULT_LAYER_OPTIONS).forEach(([name, value]) => {
      //   expect(layerOptions[name]).toEqual(value);
      // });
    });

    it("should update the managed layer's options with the given options object", () => {
      expect(managedLayerFeature._managedLayers.layer1.customProperty).not.toBeDefined();

      managedLayerFeature.registerLayer('layer1', {customProperty: 'value'});

      expect(managedLayerFeature._managedLayers.layer1.customProperty).toEqual('value');
    });

    it("should set the layer's isActive property to true if an animation feature exists and contains an animation with the given name", () => {
      expect(managedLayerFeature._managedLayers.layer1.isActive).toBeFalse();

      managedLayerFeature.registerLayer('layer1');

      expect(managedLayerFeature._managedLayers.layer1.isActive).toBeTrue();
    });

    it('should execute registerAnimation for any animations defined in the options object', () => {
      managedLayerFeature.registerLayer('layer1', {
        animations: {anim1: {customProperty: 1}, anim2: {customProperty: 2}},
      });

      expect(onRegisterAnimation).toHaveBeenCalledWith('layer1', 'anim1', {
        customProperty: 1,
      });

      expect(onRegisterAnimation).toHaveBeenCalledWith('layer1', 'anim2', {
        customProperty: 2,
      });
      onRegisterAnimation.mockRestore();
    });
  });

  describe('registerAnimation', () => {
    let onRegisterLayer: any;

    beforeEach(() => {
      onRegisterLayer = jest.spyOn(managedLayerFeature, 'registerLayer');
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
        layer2: {
          isActive: true,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
      };
    });

    it('should execute onRegisterLayer if there is no managed layer matching the given layerName', () => {
      managedLayerFeature.registerAnimation('layer3', 'anim1');

      expect(onRegisterLayer).toHaveBeenCalledWith('layer3');
      onRegisterLayer.mockRestore();
    });

    it("should add a new key to the managed layer's animations property if on with the given name does not already exist", () => {
      expect(managedLayerFeature._managedLayers.layer1.animations.anim3).not.toBeDefined();

      managedLayerFeature.registerAnimation('layer1', 'anim3');

      expect(managedLayerFeature._managedLayers.layer1.animations.anim3).toBeDefined();
    });

    it("should update the managed animation's options with the given options object", () => {
      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.customProperty).not.toBeDefined();

      managedLayerFeature.registerAnimation('layer1', 'anim1', {
        customProperty: 'value',
      });

      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.customProperty).toEqual('value');
    });

    it("should set the animation's isActive property to true if an animation feature exists and contains an animation with the given name on a layer with the given name", () => {
      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.isActive).toBeFalse();

      managedLayerFeature.registerAnimation('layer1', 'anim1');

      expect(managedLayerFeature._managedLayers.layer1.animations.anim1.isActive).toBeTrue();
    });
  });

  describe('setLayerWeights', () => {
    beforeEach(() => {
      managedLayerFeature._managedLayers = {
        layer1: {
          isActive: true,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
        layer2: {
          isActive: false,
          animations: {anim1: {isActive: false}, anim2: {isActive: false}},
        },
      };
    });

    it('should execute AnimationFeature.setLayerWeight on all active managed layers by default', () => {
      managedLayerFeature.setLayerWeights(undefined, 1, 1, undefined);

      expect(mockAnimationFeature.setLayerWeight).toHaveBeenCalledWith('layer1', 1, 1, undefined);

      expect(mockAnimationFeature.setLayerWeight).not.toHaveBeenCalledWith('layer2', 1, 1, undefined);
    });

    it('should execute AnimationFeature.setLayerWeight on any active managed layers that pass the name filter', () => {
      managedLayerFeature._managedLayers.layer2.isActive = true;
      managedLayerFeature.setLayerWeights((name) => name.endsWith('2'), 1, 1, undefined);

      expect(mockAnimationFeature.setLayerWeight).not.toHaveBeenCalledWith('layer1', 1, 1, undefined);

      expect(mockAnimationFeature.setLayerWeight).toHaveBeenCalledWith('layer2', 1, 1, undefined);
    });

    it('should not execute AnimationFeature.setLayerWeight if there are no active layers', () => {
      managedLayerFeature._managedLayers.layer1.isActive = false;
      managedLayerFeature.setLayerWeights(undefined, 1, 1, undefined);

      expect(mockAnimationFeature.setLayerWeight).not.toHaveBeenCalled();
    });
  });

  describe('enable', () => {
    it('should execute setLayerWeights with a weight value of 1', () => {
      const onSetLayerWeights = jest.spyOn(managedLayerFeature, 'setLayerWeights');

      managedLayerFeature.enable();

      expect(onSetLayerWeights).toHaveBeenCalledWith(undefined, 1, undefined, undefined);
      onSetLayerWeights.mockRestore();
    });
  });

  describe('disable', () => {
    it('should execute setLayerWeights with a weight value of 0', () => {
      const onSetLayerWeights = jest.spyOn(managedLayerFeature, 'setLayerWeights');

      managedLayerFeature.disable();

      expect(onSetLayerWeights).toHaveBeenCalledWith(undefined, 0, undefined, undefined);
      onSetLayerWeights.mockRestore();
    });
  });
});
