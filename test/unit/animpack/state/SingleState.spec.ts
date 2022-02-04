import {describeHostEnvironment} from '../../EnvironmentHarness';
import {AnimationClip, EventDispatcher, LoopRepeat, LoopOnce, NormalAnimationBlendMode} from 'three';
import {Deferred} from '@core/Deferred';
import {LayerBlendMode} from '@core/animpack/AnimationLayer';
import {SingleState as CoreSingleState} from '@core/animpack/state/SingleState';
import {SingleState} from '@app/animpack/state/SingleState';

describeHostEnvironment('SingleState', (options: any = {}, env: string) => {
  let state: any; // SingleState | CoreSingleState;

  beforeEach(() => {
    let mockThreeAction: any;
    let mockThreeMixer: EventDispatcher;

    switch (env) {
      case 'three':
        mockThreeMixer = new EventDispatcher();
        mockThreeAction = {
          name: 'state1',
          clampWhenFinished: false,
          enabled: false,
          loop: LoopRepeat,
          paused: false,
          repetitions: Infinity,
          timeScale: 1,
          weight: 1,
          blendMode: NormalAnimationBlendMode,
          reset: jest.fn().mockName('reset'),
          play: jest.fn().mockName('play'),
          setEffectiveWeight: jest.fn().mockName('setEffectiveWeight'),
          getMixer: () => {
            return mockThreeMixer;
          },
        };
        state = new SingleState(undefined, mockThreeAction);
        break;

      case 'core':
      default:
        state = new CoreSingleState();
        break;
    }
  });

  describe('normalizedTime', () => {
    switch (env) {
      case 'three':
        describe('three get', () => {
          it('should return 0 if time does not exist in threeAction', () => {
            expect(state.normalizedTime).toEqual(0);
          });

          it('should return time divided by clip duration', () => {
            if (state._threeAction) {
              state._threeAction.time = 0.5;
              state._threeAction.getClip = jest.fn(() => new AnimationClip('test', 1)).mockName('getClip');
            }

            expect(state.normalizedTime).toEqual(0.5);
          });
        });

        describe('three set', () => {
          beforeEach(() => {
            if (state._threeAction) {
              state._threeAction.time = 0.5;
              state._threeAction.getClip = jest.fn(() => new AnimationClip('test', 1)).mockName('getClip');
            }
          });

          it('should set the _threeAction time to the target time by multiplying clip duration', () => {
            state.normalizedTime = 1;

            expect(state._threeAction.time).toEqual(1);
          });

          it('should clamp the time into 0 and 1', () => {
            state.normalizedTime = 10;

            expect(state._threeAction.time).toEqual(1);
          });
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('timeScale', () => {
    it('should return a number', () => {
      expect(typeof state.timeScale).toEqual('number');
    });

    switch (env) {
      case 'three':
        it('should set the _threeAction timeScale property to the input value', () => {
          expect(state._threeAction.timeScale).toEqual(1);

          state.timeScale = 2;

          expect(state._threeAction.timeScale).toEqual(2);
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('timeScalePending', () => {
    it('should return true if the timeScale promise has not been resolved, rejected or canceled', () => {
      state._promises.timeScale = new Deferred();

      expect(state.timeScalePending).toBeTrue();
    });

    it('should return false if the timeScale promise has been resolved', () => {
      state._promises.timeScale = new Deferred();

      expect(state.timeScalePending).toBeTrue();

      state._promises.timeScale.resolve();

      expect(state.timeScalePending).toBeFalse();
    });

    it('should return false if the timeScale promise has been rejected', () => {
      state._promises.timeScale = new Deferred();

      expect(state.timeScalePending).toBeTrue();

      state._promises.timeScale.reject();

      state._promises.timeScale.catch((e: any) => {});

      expect(state.timeScalePending).toBeFalse();
    });

    it('should return false if the timeScale promise has been canceled', () => {
      state._promises.timeScale = new Deferred();

      expect(state.timeScalePending).toBeTrue();

      state._promises.timeScale.cancel();

      expect(state.timeScalePending).toBeFalse();
    });
  });

  describe('setTimeScale', () => {
    it('should return a deferred promise', () => {
      const interpolator = state.setTimeScale(0);

      expect(interpolator).toBeInstanceOf(Deferred);
    });

    it('should update the timeScale value when the promise is executed', () => {
      const interpolator = state.setTimeScale(0, 1) as Deferred;

      expect(state.timeScale).toEqual(1);

      interpolator.execute(250);

      expect(state.timeScale).toEqual(0.75);
    });

    it('should resolve once the timeScale reaches the target value', async () => {
      const interpolator = state.setTimeScale(0, 1);

      interpolator.execute(1000);

      await expect(interpolator).toResolve();
    });
  });

  describe('loopCount', () => {
    it('should return a number', () => {
      expect(typeof state.loopCount).toEqual('number');
    });

    switch (env) {
      case 'three':
        it('should set _threeAction.repetitions to the value of loopCount', () => {
          state.loopCount = 1;

          expect(state._threeAction.repetitions).toEqual(1);

          state.loopCount = 10;

          expect(state._threeAction.repetitions).toEqual(10);
        });

        it('should set _threeAction.loop to LoopRepeat if loopCount is greater than 1', () => {
          state.loopCount = 10;

          expect(state._threeAction.loop).toEqual(LoopRepeat);
        });

        it('should set _threeAction.loop to LoopOnce if loopCount equals 1', () => {
          state.loopCount = 1;

          expect(state._threeAction.loop).toEqual(LoopOnce);
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('blendMode', () => {
    it('should return a value from LayerBlendModes', () => {
      expect(Object.values(LayerBlendMode)).toContain(state.blendMode);
    });
  });

  describe('updateInternalWeight', () => {
    switch (env) {
      case 'three':
        it('should execute setEffectiveWeight on _threeAction using _internalWeight', () => {
          state.weight = 1;
          state.updateInternalWeight(0.25);

          expect(state._threeAction.setEffectiveWeight).toHaveBeenCalledWith(state._internalWeight);
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('play', () => {
    switch (env) {
      case 'three':
        it('should execute reset on _threeAction', () => {
          state.play();

          expect(state._threeAction.reset).toHaveBeenCalledTimes(1);
        });

        it('should execute play on _threeAction', () => {
          state.play();

          expect(state._threeAction.play).toHaveBeenCalledTimes(1);
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('pause', () => {
    switch (env) {
      case 'three':
        it('should set _threeAction.paused to true', () => {
          state._threeAction.paused = false;

          state.pause();

          expect(state._threeAction.paused).toBeTrue();
        });

        it('should execute play on _threeAction', () => {});
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('resume', () => {
    switch (env) {
      case 'three':
        it('should set _threeAction.paused to false', () => {
          state._threeAction.paused = true;

          state.resume();

          expect(state._threeAction.paused).toBeFalse();
        });

        it('should set _threeAction.enabled to true', () => {
          state._threeAction.enabled = false;

          state.resume();

          expect(state._threeAction.enabled).toBeTrue();
        });

        it('should execute play on _threeAction', () => {
          state.resume();

          expect(state._threeAction.play).toHaveBeenCalledTimes(1);
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('cancel', () => {
    switch (env) {
      case 'three':
        it('should set _threeAction.paused to true', () => {
          state._threeAction.paused = false;

          state.cancel();

          expect(state._threeAction.paused).toBeTrue();
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('stop', () => {
    switch (env) {
      case 'three':
        it('should execute reset on _threeAction', () => {
          state.stop();

          expect(state._threeAction.reset).toHaveBeenCalledTimes(1);
        });

        it('should set _threeAction.paused to true', () => {
          state._threeAction.paused = false;

          state.stop();

          expect(state._threeAction.paused).toBeTrue();
        });

        it('should execute play on _threeAction', () => {
          state.stop();

          expect(state._threeAction.play).toHaveBeenCalledTimes(1);
        });
        break;

      case 'core':
      default:
        break;
    }
  });

  describe('discard', () => {
    switch (env) {
      case 'three':
        it("should stop listening to the mixer's finish event", () => {
          const onRemoveListener = jest.spyOn(state._threeAction.getMixer(), 'removeEventListener');
          state.discard();

          expect(onRemoveListener).toHaveBeenCalledWith('finished', state._onFinishedEvent);
        });

        it('should set enabled on _threeAction to false', () => {
          state._threeAction.enabled = true;

          state.discard();

          expect(state._threeAction.enabled).toBeFalse();
        });
        break;

      case 'core':
      default:
        break;
    }
  });
});
