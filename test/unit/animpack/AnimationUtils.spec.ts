import {Deferred} from '@core/Deferred';
import {AnimationUtils} from '@core/animpack/AnimationUtils';

describe('AnimationUtils', () => {
  describe('interpolateProperty', () => {
    it('should return a Deferred promise', () => {
      const animated = {weight: 0};

      expect(AnimationUtils.interpolateProperty(animated, 'weight', 1)).toBeInstanceOf(Deferred);
    });

    it('should return a rejected promise if the property owner is not an object', () => {
      return expect(AnimationUtils.interpolateProperty()).toReject();
    });

    it('should return a rejected promise if the property value is not numeric', () => {
      const animated = {weight: 'abc'};

      return expect(AnimationUtils.interpolateProperty(animated, 'weight', 1)).toReject();
    });

    it('should set the property to the target value and resolve on its own if the seconds option is 0 or undefined', async () => {
      const animated = {weight: 0};

      // TODO: Verify - https://www.npmjs.com/package/jest-extended#toresolve
      await expect(AnimationUtils.interpolateProperty(animated, 'weight', 1)).toResolve();

      expect(animated.weight).toEqual(1);

      await expect(AnimationUtils.interpolateProperty(animated, 'weight', 2, {seconds: 0})).toResolve();

      expect(animated.weight).toEqual(2);
    });

    it('should log a warning if the seconds option is defined and not a number', () => {
      const onWarn = jest.spyOn(console, 'warn');
      const animated = {weight: 0};

      AnimationUtils.interpolateProperty(animated, 'weight', 1, {seconds: 'one'});

      expect(onWarn).toHaveBeenCalledTimes(1);
      onWarn.mockRestore();
    });

    it('should log a warning if the easingFn option is defined and not a function', () => {
      const onWarn = jest.spyOn(console, 'warn');
      const animated = {weight: 0};

      AnimationUtils.interpolateProperty(animated, 'weight', 1, {seconds: 1, easingFn: 'notAFunction'});

      expect(onWarn).toHaveBeenCalledTimes(1);
      onWarn.mockRestore();
    });

    describe('execute', () => {
      it('should reject the promise if a non-numeric deltaTime argument is passed', () => {
        const animated = {weight: 0};
        const interpolator = AnimationUtils.interpolateProperty(animated, 'weight', 1, {
          seconds: 1,
        });

        if (interpolator instanceof Deferred) {
          interpolator.execute('abc');
        }
        return expect(interpolator).toReject();
      });

      it('should reject the promise if the easing function does not return a numeric value', () => {
        const animated = {weight: 0};
        const interpolator = AnimationUtils.interpolateProperty(animated, 'weight', 1, {
          seconds: 1,
          easingFn: () => {},
        });

        if (interpolator instanceof Deferred) {
          interpolator.execute(1000);
        }
        return expect(interpolator).toReject();
      });

      it('should execute the onProgress function argument', () => {
        const animated = {weight: 0};
        const onProgress = jest.fn().mockName('onProgress');
        const interpolator = AnimationUtils.interpolateProperty(animated, 'weight', 1, {seconds: 1, onProgress});

        if (interpolator instanceof Deferred) {
          interpolator.execute(100);
        }

        expect(onProgress).toHaveBeenCalledWith(0.1);
      });

      it('should resolve the promise once the target value is reached and seconds has elapsed', () => {
        const animated = {weight: 0};
        const interpolator = AnimationUtils.interpolateProperty(animated, 'weight', 1, {seconds: 1});

        if (interpolator instanceof Deferred) {
          interpolator.execute(1000);
        }
        return expect(interpolator).toResolve();
      });
    });
  });
});
