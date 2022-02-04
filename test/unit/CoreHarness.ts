import {Env} from '@core/Utils';

export function describeCoreHost(description: string, fn: any) {
  describe(`Core Host - ${description}`, () => {
    const owner = {id: '1234'};

    fn({owner}, Env.Core);
    // console.log(Env.Core);
  });
}
