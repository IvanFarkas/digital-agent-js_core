import { AnimationMixer } from 'three';
import { AnimationFeature as CoreAnimationFeature, AnimationTypes } from '../../core/animpack/AnimationFeature';
import { HostObject } from '../../core/HostObject';
import { SingleState } from '../../three.js/animpack/state/SingleState';

/**
 * Threejs AnimationMixer object
 * @external "THREE.AnimationMixer"
 * @see https://threejs.org/docs/#api/en/animation/AnimationMixer
 */
// TODO: Do we need this? AnimationTypes are set up in core/animpack/AnimationFeature
// AnimationTypes.single = SingleState;
export { AnimationTypes };

/**
 * @extends core/AnimationFeature
 * @alias three.js/AnimationFeature
 *
 * @property {AnimationMixer} _mixer - THREE Animation Mixer.
 * @property {any} clip - Clip.
 */
export class AnimationFeature extends CoreAnimationFeature {
  private _mixer: AnimationMixer;

  /**
   * @constructor
   *
   * @param {three.js/HostObject} host - Host object that owns the feature.
   */
  constructor(host: HostObject) {
    super(host);
    this._mixer = new AnimationMixer(host.owner);
  }

  /**
   * Create Single State
   *
   * @param options {any}
   *
   * @returns
   */
  _createSingleState(options: any) {
    // Duplicate the clip if it is already in use by another three action
    let { clip } = options;

    if (this._mixer.existingAction(clip)) {
      clip = clip.clone();
    }

    const threeAction = this._mixer.clipAction(clip);

    return new SingleState(options, threeAction);
  }

  /**
   * Get the AnimationMixer for the host.
   *
   * @readonly
   * @type {AnimationMixer}
   */
  get mixer(): AnimationMixer {
    return this._mixer;
  }

  /**
   * Executes each time the host is updated.
   *
   * @param {number} deltaTime - Amount of time since the last host update was called.
   */
  update(deltaTime: number) {
    super.update(deltaTime);
    if (!this.paused) {
      this._mixer.update(deltaTime / 1000); // AnimationMixer requires delta time in seconds
    }
  }

  /**
   * Discard.
   */
  discard() {
    // Release THREE animation resources
    this._mixer.uncacheRoot(this.host.owner);
    super.discard();
  }
}
