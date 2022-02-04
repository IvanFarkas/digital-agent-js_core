import {Scene, Object3D} from 'three';
import {Env} from '@core/Utils';

export function describeThreeHost(description: string, fn: any) {
  describe(`Three Host - ${description}`, () => {
    const scene = new Scene();
    const owner = new Object3D();

    scene.add(owner);
    fn({scene, owner}, Env.Three);
    // console.log(Env.Three);
  });
}
