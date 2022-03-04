// Fix circular dependency issues - https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de

/**
 * @module three/HOST
 */

import aws from '@core/awspack';
import anim from '@core/animpack';

import { Utils } from '@core/Utils';
import { MathUtils } from '@core/MathUtils';
import { Deferred } from '@core/Deferred';
import { LipsyncFeature, DefaultVisemeMap } from '@core/LipsyncFeature';
import { GestureFeature, DefaultGestureWords } from '@core/GestureFeature';
import { PointOfInterestFeature, AxisMap } from '@core/PointOfInterestFeature';
import { env } from '@core/HostEnvironment';
import { Messenger } from '@core/Messenger';
import { HostObject } from '@core/HostObject';

export default {
  /**
   * @see env
   */
  env,
  /**
   * @see Utils
   */
  Utils,
  /**
   * @see MathUtils
   */
  MathUtils,
  /**
   * @see Deferred
   */
  Deferred,
  /**
   * @see three.js/Messenger
   */
  Messenger,
  /**
   * @see three.js/HostObject
   */
  HostObject,
  /**
   * @see core/LipsyncFeature
   */
  LipsyncFeature,
  /**
   * @see GestureFeature
   */
  GestureFeature,
  /**
   * @see three.js/PointOfInterestFeature
   */
  PointOfInterestFeature,
  /**
   * @see DefaultVisemeMap
   */
  DefaultVisemeMap,
  /**
   * @see DefaultGestureWords
   */
  DefaultGestureWords,
  /**
   * @see AxisMap
   */
  AxisMap,
  /**
   * @see module:three/awspack
   */
  aws,
  /**
   * @see module:three/animpack
   */
  anim,
};
