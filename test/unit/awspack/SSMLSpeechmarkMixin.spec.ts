import {describeHostEnvironment} from '../EnvironmentHarness';
import {SSMLSpeechmarkMixin} from '@core/awspack/SSMLSpeechmarkMixin';
import {HostFeatureMixin} from '@core/HostFeatureMixin';
import {HostObject} from '@core/HostObject';
import {MixinBase} from '@core/MixinBase';

describeHostEnvironment('SSMLSpeechmarkMixin', () => {
  let ssmlMarkFeature: any;
  let host: HostObject;

  beforeEach(() => {
    host = new HostObject();

    const HostFeature = SSMLSpeechmarkMixin(HostFeatureMixin(MixinBase));

    host.addFeature(HostFeature);
    ssmlMarkFeature = host._features.get('SSMLSpeechmarkClass');
    ssmlMarkFeature.callback = jest.fn();
  });

  describe('_onSsml', () => {
    it('should call the callback function if all the criteria meet', () => {
      const speechMark = {type: 'ssml', value: '{"feature":"SSMLSpeechmarkClass","method":"callback","args":["name", 1]}'};

      ssmlMarkFeature._onSsml({mark: speechMark});

      expect(ssmlMarkFeature.callback).toHaveBeenCalledWith('name', 1);
    });

    it('should not call the callback function if feature doesnt exist', () => {
      const speechMark = {type: 'ssml', value: '{"feature":"AnimationFeature","method":"callback","args":["name", 1]}'};

      ssmlMarkFeature._onSsml({mark: speechMark});

      expect(ssmlMarkFeature.callback).not.toHaveBeenCalled();
    });

    it('should not call the callback function if function doesnt exist in feature', () => {
      jest.spyOn(console, 'warn');

      const speechMark = {type: 'ssml', value: '{"feature":"SSMLSpeechmarkClass","method":"notExist","args":["name", 1]}'};

      ssmlMarkFeature._onSsml({mark: speechMark});

      expect(ssmlMarkFeature.callback).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
