/**
 * @module core/animpack
 */

 import { Linear, Quadratic, Cubic, Quartic, Quintic, Sinusoidal, Exponential, Circular, Elastic, Back, Bounce } from '@core/animpack/Easing';
 import { AnimationFeature, AnimationTypes } from '@core/animpack/AnimationFeature';
 import { AnimationLayer, LayerBlendModes, DefaultLayerBlendMode } from '@core/animpack/AnimationLayer';
 import { SingleState } from '@core/animpack/state/SingleState';
 import { TransitionState } from '@core/animpack/state/TransitionState';
 import { FreeBlendState } from '@core/animpack/state/FreeBlendState';
 import { QueueState } from '@core/animpack/state/QueueState';
 import { RandomAnimationState } from '@core/animpack/state/RandomAnimationState';
 import { Blend1dState } from '@core/animpack/state/Blend1dState';
 import { Blend2dState } from '@core/animpack/state/Blend2dState';
 import { AnimationUtils } from '@core/animpack/AnimationUtils';
 
 /**
  * @namespace
  */
 const Easing = {
   /**
    * @see Linear
    */
   Linear,
   /**
    * @see Quadratic
    */
   Quadratic,
   /**
    * @see Cubic
    */
   Cubic,
   /**
    * @see Quartic
    */
   Quartic,
   /**
    * @see Quintic
    */
   Quintic,
   /**
    * @see Sinusoidal
    */
   Sinusoidal,
   /**
    * @see Exponential
    */
   Exponential,
   /**
    * @see Circular
    */
   Circular,
   /**
    * @see Elastic
    */
   Elastic,
   /**
    * @see Back
    */
   Back,
   /**
    * @see Bounce
    */
   Bounce,
 };
 
 export default {
   /**
    * @see core/AnimationFeature
    */
   AnimationFeature,
   /**
    * @see AnimationLayer
    */
   AnimationLayer,
   /**
    * @see core/SingleState
    */
   SingleState,
   /**
    * @see TransitionState
    */
   TransitionState,
   /**
    * @see FreeBlendState
    */
   FreeBlendState,
   /**
    * @see QueueState
    */
   QueueState,
   /**
    * @see RandomAnimationState
    */
   RandomAnimationState,
   /**
    * @see Blend1dState
    */
   Blend1dState,
   /**
    * @see Blend2dState
    */
   Blend2dState,
   /**
    * @see AnimationUtils
    */
   AnimationUtils,
 
   Easing,
   /**
    * @see LayerBlendModes
    */
   LayerBlendModes,
   /**
    * @see DefaultLayerBlendMode
    */
   DefaultLayerBlendMode,
   /**
    * @see AnimationTypes
    */
   AnimationTypes,
 };
 