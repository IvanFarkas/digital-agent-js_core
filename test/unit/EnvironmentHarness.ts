import {Env} from '@core/Utils';
import {env} from '@app/HostEnvironment';
import {describeCoreHost} from './CoreHarness';
import {describeThreeHost} from './ThreeHarness';

export function describeHostEnvironment(description: string, fn: any) {
  // describeThreeHost(description, fn);
  // describeCoreHost(description, fn);

  switch (env) {
    case Env.Three:
      describeThreeHost(description, fn);
      break;

    case Env.Core:
    default:
      describeCoreHost(description, fn);
      break;
  }
}
