/**
 * @module core/HOST
 */

import aws from './awspack';
import anim from './animpack';
import {env} from './HostEnvironment';
import {Utils} from '@core/Utils';
import {MathUtils} from '@core/MathUtils';
import {Deferred} from '@core/Deferred';
import {Messenger} from '@core/Messenger';
import {HostObject} from '@core/HostObject';
import {LipsyncFeature, DefaultVisemeMap} from './LipsyncFeature';
import {GestureFeature, DefaultGestureWords} from './GestureFeature';
import {PointOfInterestFeature, AxisMap} from './PointOfInterestFeature';

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
   * @see core/Messenger
   */
  Messenger,
  /**
   * @see core/HostObject
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
   * @see core/PointOfInterestFeature
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
   * @see module:core/awspack
   */
  aws,
  /**
   * @see module:core/animpack
   */
  anim,
};
