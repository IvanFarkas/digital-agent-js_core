import 'jest-extended';
import {Utils} from '@core/Utils';
import {Deferred} from '@core/Deferred';

describe('Utils', () => {
  describe('createId', () => {
    it('should generate a string', () => {
      const actual = typeof Utils.createId();
      const expected = 'string';

      expect(actual).toEqual(expected);
    });
  });

  describe('getUniqueName', () => {
    const names = ['name', 'nameOther', 'name1', 'name5', 'name-5', 'name14'];

    it('should return the original name if it is not included in the provided array of names', () => {
      expect(Utils.getUniqueName('uniqueName', names)).toEqual('uniqueName');
      expect(Utils.getUniqueName('name', names)).not.toEqual('name');
    });

    it('should return a string that matches the original name with the highest trailing number appended if it is included in the provided array of names', () => {
      expect(Utils.getUniqueName('name', names)).toEqual('name15');
      expect(Utils.getUniqueName('name-5', names)).toEqual('name-6');
      expect(Utils.getUniqueName('nameOther', names)).toEqual('nameOther1');
    });
  });

  describe('wait', () => {
    it('should return a Deferred promise', () => {
      expect(Utils.wait(3)).toBeInstanceOf(Deferred);
    });

    it('should resolve immediately if the seconds argument is less than or equal to zero', async () => {
      await expect(Utils.wait(0)).toResolve();
      await expect(Utils.wait(-1)).toResolve();
    });

    describe('execute', () => {
      it('should reject the promise if a non-numeric deltaTime argument is passed', () => {
        const wait = Utils.wait(1) as Deferred;

        wait.execute('notANumber');
        return expect(wait).toReject();
      });

      it('should execute the onP function argument each time the deferred is executed with a non-zero delta time', () => {
        const onProgress = jest.fn().mockName('onProgress');
        const wait = Utils.wait(1, {onProgress}) as Deferred;

        wait.execute(0);
        expect(onProgress).not.toHaveBeenCalled();
        wait.execute(100);
        expect(onProgress).toHaveBeenCalledTimes(1);
      });

      it('should resolve the promise once the required number of seconds has elapsed', async () => {
        const wait = Utils.wait(1) as Deferred;

        wait.execute(1000);

        await expect(wait).toResolve();
      });
    });
  });
});
