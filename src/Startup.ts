// AWS SDK for JavaScript - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/welcome.html
// AWS SDK for JavaScript v2 - https://github.com/aws/aws-sdk-js
// AWS Clients - https://github.com/aws/aws-sdk-js/tree/master/clients

// import entire SDK
// import AWS from 'aws-sdk';

// import AWS object without services
import AWS from 'aws-sdk/global';

// import individual service
import Polly from 'aws-sdk/clients/polly';

// Three.js
import { Scene, Clock, Group, Event, PerspectiveCamera, Vector3, Object3D, AnimationClip, AnimationUtils, AudioListener } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { HostObject } from './three.js/HostObject';
import { TextToSpeechFeature } from './three.js/awspack/TextToSpeechFeature';
import { PointOfInterestFeature } from './three.js/PointOfInterestFeature';
import { AnimationFeature } from './three.js/animpack/AnimationFeature';
import { AnimationTypes } from './core/animpack/AnimationFeature';
import { LayerBlendModes } from './core/animpack/AnimationLayer';
import { Quadratic } from './core/animpack/Easing';
import { GestureFeature } from './core/GestureFeature';
import { LipsyncFeature } from './core/LipsyncFeature';

interface ICharacter {
  name: string;
  characterFile: string;
  animationPath: string;
  audioAttachJoint: string;
  lookJoint: string;
  voice: string;
  voiceEngine: string;
  position: Vector3;
  rotate: Vector3;
  host: HostObject | undefined;
  character: Group | undefined;
  lookTracker: Object3D | undefined;
  clips: AnimationClip[][] | undefined;
  bindPoseOffset: AnimationClip | undefined;
  audioAttach: Object3D<Event> | undefined;
  gestureConfig: any | undefined;
  poiConfig: any | undefined;
  text: string | null;
  emot: string | null;
}

const REGION = 'us-east-1';
const IDENTITYPOOLID = 'us-east-1:be0bcebf-7d62-45f9-8257-55894003beb7';
const VERSION = '2.1048.0';

export class Startup {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private clock: Clock;
  private renderFn: any[] = [];
  private speakers: Map<string, HostObject> = new Map<string, HostObject>();
  private Characters: ICharacter[] = [
    {
      name: 'Luke',
      characterFile: 'assets/glTF/characters/adult_male/luke/luke.gltf',
      animationPath: 'assets/glTF/animations/adult_male',
      audioAttachJoint: 'chardef_c_neckB', // Name of the joint to attach audio to
      lookJoint: 'charjx_c_look', // Name of the joint to use for point of interest target tracking
      voice: 'Matthew', // Polly voice. Full list of available voices at: https://docs.aws.amazon.com/polly/latest/dg/voicelist.html:
      voiceEngine: 'neural', // Neural engine is not available for all voices in all regions: https://docs.aws.amazon.com/polly/latest/dg/NTTS-main.html
      position: new Vector3(0.5, 0, 0), // 1.25, 0, 0
      rotate: new Vector3(0, -0.3, 0), // 0, -0.5, 0
      host: undefined,
      character: undefined,
      lookTracker: undefined,
      clips: undefined,
      bindPoseOffset: undefined,
      audioAttach: undefined,
      gestureConfig: undefined,
      poiConfig: undefined,
      text: `<speak>
      <amazon:domain name="conversational">
        Hello, my name is Luke.
        I used to only be a host inside Amazon Sumerian, but now you can use me in other Javascript runtime environments like three js and Babylon js.
        Right now, <mark name='{"feature":"PointOfInterestFeature","method":"setTargetByName","args":["chargaze"]}'/> my friend and I here are in three js.
      </amazon:domain>
    </speak>`,
      emot: 'applause', // cheer, bored
    },
    {
      name: 'Alien',
      characterFile: 'assets/glTF/characters/alien/alien.gltf',
      animationPath: 'assets/glTF/animations/alien',
      audioAttachJoint: 'charhead',
      lookJoint: 'chargaze',
      voice: 'Ivy',
      voiceEngine: 'neural',
      position: new Vector3(-0.5, 0, 0), // -0.5, 0, 0
      rotate: new Vector3(0, 0.3, 0), // 0, 0.5, 0
      host: undefined,
      character: undefined,
      lookTracker: undefined,
      clips: undefined,
      bindPoseOffset: undefined,
      audioAttach: undefined,
      gestureConfig: undefined,
      poiConfig: undefined,
      text: `<speak>
      Hi there!
      As you can see I'm set up to be a host too, although I don't use the same type of skeleton as any of the original Amazon Sumerian hosts.
      With open source hosts, you can apply host functionality to any custom animated character you'd like.
      I'm excited to see what kinds of interesting host characters you'll bring to life!
    </speak>`,
      emot: 'angry',
    },
  ];
  private currentCharacter: ICharacter = this.Characters[0];

  constructor(scene: Scene, camera: PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.clock = new Clock();

    // Initialize AWS and create Polly service objects
    console.debug('Initialize AWS and create Polly service objects');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    AWS.config.region = REGION;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: IDENTITYPOOLID });
  }

  public async initialize() {
    try {
      console.debug('initialize()');

      // Define the glTF assets that will represent the host
      const animationFiles = ['stand_idle.glb', 'lipsync.glb', 'gesture.glb', 'emote.glb', 'face_idle.glb', 'blink.glb', 'poi.glb'];
      const gestureConfigFile = 'gesture.json';
      const poiConfigFile = 'poi.json';
      const polly = new Polly({ region: REGION });
      const presigner = new Polly.Presigner();
      const speechInit = TextToSpeechFeature.initializeService(polly, presigner, VERSION);
      const char1 = this.Characters[0];
      const char2 = this.Characters[1];

      await this.loadCharacter(this.scene, animationFiles, char1);
      await this.loadCharacter(this.scene, animationFiles, char2);

      // Find the joints defined by name
      char1.audioAttach = char1?.character?.getObjectByName(char1.audioAttachJoint);
      char2.audioAttach = char2?.character?.getObjectByName(char2.audioAttachJoint);
      char1.lookTracker = char1?.character?.getObjectByName(char1.lookJoint);
      char2.lookTracker = char2?.character?.getObjectByName(char2.lookJoint);

      // Read the gesture config file.
      // This file contains options for splitting up each animation in gestures.glb into 3 sub-animations and initializing them as a QueueState animation.
      char1.gestureConfig = await fetch(`${char1.animationPath}/${gestureConfigFile}`).then((response) => response.json());
      char2.gestureConfig = await fetch(`${char2.animationPath}/${gestureConfigFile}`).then((response) => response.json());

      // Read the point of interest config file.
      // This file contains options for creating Blend2dStates from look pose clips and initializing look layers on the PointOfInterestFeature.
      char1.poiConfig = await fetch(`${char1.animationPath}/${poiConfigFile}`).then((response) => response.json());
      char2.poiConfig = await fetch(`${char2.animationPath}/${poiConfigFile}`).then((response) => response.json());

      const host1 = this.createHost(char1);
      const host2 = this.createHost(char2);

      // Set up each host to look at the other when the other speaks and at the this.camera when speech ends
      this.initializePoI(host1, char1, host2, char2);

      await speechInit;

      if (host1 && host2) {
        this.speakers.set('Luke', host1);
        this.speakers.set('Alien', host2);
      }
    } catch (error) {
      console.debug(error);
      throw new Error(`initialize - ${error}`);
    }
  }

  initializePoI(host1: HostObject | undefined, char1: ICharacter | undefined, host2: HostObject | undefined, char2: ICharacter | undefined) {
    try {
      if (!host1 || !host2) {
        throw new Error(`Hosts are empty!`);
      }
      if (!char1 || !char2) {
        throw new Error(`Characters are empty!`);
      }

      console.debug('initializePoI()');

      // TODO": Global Fix P2. Find a better Feature management with design patterns.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const host1PoiFeature = host1.PointOfInterestFeature;
      // TODO": Global Fix P2. Find a better Feature management with design patterns.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const host2PoiFeature = host2.PointOfInterestFeature;
      // const host1PoiFeature = host1.getFeature('PointOfInterestFeature') as PointOfInterestFeature;
      // const host2PoiFeature = host2.getFeature('PointOfInterestFeature') as PointOfInterestFeature;

      // Set up each host to look at the other when the other speaks and at the camera when speech ends
      const onHost1StartSpeech = () => {
        // TODO: Validate
        // host2.PointOfInterestFeature.setTarget(lookTracker1);
        host2PoiFeature.setTarget(char1.lookTracker);
      };
      const onHost2StartSpeech = () => {
        // TODO: Validate
        // host1.PointOfInterestFeature.setTarget(lookTracker2);
        host1PoiFeature.setTarget(char2.lookTracker);
      };
      const onStopSpeech = () => {
        host1PoiFeature.setTarget(this.camera);
        host2PoiFeature.setTarget(this.camera);
      };

      // TODO: Validate. Original JS code got EVENTS from host specific feature, while events are static, same for all istances.
      // host1.listenTo(host1.TextToSpeechFeature.EVENTS.play, onHost1StartSpeech);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      host1.listenTo(`TextToSpeechFeature.${TextToSpeechFeature.EVENTS.play}`, onHost1StartSpeech);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      host1.listenTo(`TextToSpeechFeature.${TextToSpeechFeature.EVENTS.resume}`, onHost1StartSpeech);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      host2.listenTo(`TextToSpeechFeature.${TextToSpeechFeature.EVENTS.play}`, onHost2StartSpeech);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      host2.listenTo(`TextToSpeechFeature.${TextToSpeechFeature.EVENTS.resume}`, onHost2StartSpeech);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      TextToSpeechFeature.listenTo(TextToSpeechFeature.EVENTS.pause, onStopSpeech);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      TextToSpeechFeature.listenTo(TextToSpeechFeature.EVENTS.stop, onStopSpeech);
    } catch (error) {
      console.debug(error);
      throw new Error(`initializePoI - ${error}`);
    }
  }

  // Load character model and animations
  async loadCharacter(scene: Scene, animFiles: string[], char: ICharacter | undefined): Promise<{ character: Group; clips: AnimationClip[][]; bindPoseOffset: AnimationClip }> {
    try {
      if (!char) {
        throw new Error(`Character is empty!`);
      }
      console.debug(`loadCharacter(${char.name})`);

      const animationPath = char.animationPath;
      const characterFile = char.characterFile;

      // Asset loader
      const gltfLoader = new GLTFLoader();
      const characterGltf = await gltfLoader.loadAsync(characterFile);

      // Load character model
      // Transform the character
      const character: Group = characterGltf.scene;
      scene.add(character);

      // Make the offset pose additive
      const [bindPoseOffset]: AnimationClip[] = characterGltf.animations;
      if (bindPoseOffset) {
        AnimationUtils.makeClipAdditive(bindPoseOffset);
      }

      // Cast shadows
      character.traverse((object: any) => {
        if (object.isMesh) {
          object.castShadow = true;
        }
      });

      // Load animations
      const clips = await Promise.all(
        animFiles.map(async (filename: string) => {
          const filePath = `${animationPath}/${filename}`;
          const animationGltf = await gltfLoader.loadAsync(filePath);

          return animationGltf.animations;
        })
      );

      character.position.set(char.position.x, char.position.y, char.position.z);
      if (char.rotate.x !== 0) {
        character.rotateX(char.rotate.x);
      }
      if (char.rotate.y !== 0) {
        character.rotateY(char.rotate.y);
      }
      if (char.rotate.z !== 0) {
        character.rotateZ(char.rotate.z);
      }

      char.character = character;
      char.clips = clips;
      char.bindPoseOffset = bindPoseOffset;
      return { character, clips, bindPoseOffset };
    } catch (error) {
      console.debug(error);
      throw new Error(`loadCharacter - ${error}`);
    }
  }

  async playPreprocessdAudio(name: string, language: string, host: any) {
    /**
     * Make sure to replace text with a unique string per audioURL and speechJson, you can keep this as the text you used to play but note that it actually won't be played as the preprocessed audio and speechMarks will be played instead.
     * Make sure to replace speechJson with the preprocessed SpeechMarks JSON Array.
     * Make sure to replace audioURL with a Blob URL of the preprocessed Audio file
     */
    // host.TextToSpeechFeature.play(text, {
    //   speechJson: speechJson,
    //   AudioURL: audioURL
    // });

    console.debug('playPreprocessdAudio', name);

    // Specify local paths. Make sure to update them to where you copy them into under your public/root folder
    const speechPath = `./assets/preprocessed/${language}/speech.json`;
    const audioPath = `./assets/preprocessed/${language}/speech.mp3`;

    // Fetch resources
    const speechJson = await (await fetch(speechPath)).json();
    const speechText = speechJson.Text.S;
    // const speechMarks = b64DecodeUnicode(speechJson.SpeechMarks.S);
    const speechMarks = speechJson.SpeechMarks.Json;
    const audioBlob = await (await fetch(audioPath)).blob();

    // Create Audio Blob URL
    const audioURL = URL.createObjectURL(audioBlob);
    const config = {
      isGlobal: true,
      // volume: 5,
      SpeechMarksJSON: speechMarks,
      AudioURL: audioURL,
    };

    // Play speech with local assets
    host.TextToSpeechFeature.play(speechText, config);
  }

  b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }

  // Initialize the host
  createHost(char: ICharacter | undefined): HostObject | undefined {
    try {
      if (!char) {
        throw new Error(`Character is empty!`);
      }
      console.debug(`createHost(${char.name})`);

      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const [idleClips, lipsyncClips, gestureClips, emoteClips, faceIdleClips, blinkClips, poiClips] = char.clips!;
      const idleClip = idleClips[0];
      const faceIdleClip = faceIdleClips[0];
      const host = new HostObject({ owner: char.character, clock: this.clock });

      char.host = host;

      // Add the host to the render loop
      this.renderFn.push(() => {
        host.update();
      });

      // Set up text to speech
      const audioListener = new AudioListener();
      this.camera.add(audioListener);
      host.addFeature(TextToSpeechFeature, false, { listener: audioListener, attachTo: char.audioAttach, voice: char.voice, engine: char.voiceEngine, isGlobal: true /* , volume: 5 */ });

      // Set up animation
      host.addFeature(AnimationFeature);

      // TODO": Global Fix P2. Find a better Feature management with design patterns.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const animationFeature = host.AnimationFeature as AnimationFeature;
      // const animationFeature = host?.getFeature('AnimationFeature') as AnimationFeature;

      // Base idle
      console.debug(`createHost(${char.name}) - Animation: Base`);
      animationFeature.addLayer('Base');
      animationFeature.addAnimation('Base', idleClip.name, AnimationTypes.single, { clip: idleClip });
      animationFeature.playAnimation('Base', idleClip.name);

      // Face idle
      console.debug(`createHost(${char.name}) - Animation: Face idle`);
      animationFeature.addLayer('Face', { blendMode: LayerBlendModes.Additive });
      AnimationUtils.makeClipAdditive(faceIdleClip);
      animationFeature.addAnimation('Face', faceIdleClip.name, AnimationTypes.single, { clip: AnimationUtils.subclip(faceIdleClip, faceIdleClip.name, 1, faceIdleClip.duration * 30, 30) });
      animationFeature.playAnimation('Face', faceIdleClip.name);

      // Blink
      console.debug(`createHost(${char.name}) - Animation: Blink`);
      animationFeature.addLayer('Blink', { blendMode: LayerBlendModes.Additive, transitionTime: 0.075 });
      if (blinkClips) {
        blinkClips.forEach((clip: any) => {
          AnimationUtils.makeClipAdditive(clip);
        });
      } else {
        console.error('blinkClips is undefined!');
      }
      animationFeature.addAnimation('Blink', 'blink', AnimationTypes.randomAnimation, {
        playInterval: 3,
        subStateOptions: blinkClips.map((clip: any) => {
          return {
            name: clip.name,
            loopCount: 1,
            clip,
          };
        }),
      });
      animationFeature.playAnimation('Blink', 'blink');

      // Talking idle
      console.debug(`createHost(${char.name}) - Animation: Talking idle`);
      animationFeature.addLayer('Talk', { transitionTime: 0.75, blendMode: LayerBlendModes.Additive });
      animationFeature.setLayerWeight('Talk', 0);
      const talkClip = lipsyncClips.find((clip: any) => clip.name === 'stand_talk');
      if (talkClip) {
        lipsyncClips.splice(lipsyncClips.indexOf(talkClip), 1);
        animationFeature.addAnimation('Talk', talkClip.name, AnimationTypes.single, { clip: AnimationUtils.makeClipAdditive(talkClip) });
        animationFeature.playAnimation('Talk', talkClip.name);
      }

      // Gesture animations
      console.debug(`createHost(${char.name}) - Animation: Gesture animations`);
      animationFeature.addLayer('Gesture', { transitionTime: 0.5, blendMode: LayerBlendModes.Additive });
      if (gestureClips) {
        gestureClips.forEach((clip: any) => {
          const { name } = clip;
          const config = char.gestureConfig[name];

          AnimationUtils.makeClipAdditive(clip);
          if (config !== undefined) {
            config.queueOptions.forEach((option: any) => {
              // Create a subclip for each range in queueOptions
              option.clip = AnimationUtils.subclip(clip, `${name}_${option.name}`, option.from, option.to, 30);
            });
            animationFeature.addAnimation('Gesture', name, AnimationTypes.queue, config);
          } else {
            animationFeature.addAnimation('Gesture', name, AnimationTypes.single, { clip });
          }
        });
      } else {
        console.error('gestureClips is undefined!');
      }

      // Emote animations
      console.debug(`createHost(${char.name}) - Animation: Emote animations`);
      animationFeature.addLayer('Emote', { transitionTime: 0.5 });
      if (emoteClips) {
        emoteClips.forEach((clip: any) => {
          const { name } = clip;
          animationFeature.addAnimation('Emote', name, AnimationTypes.single, { clip, loopCount: 1 });
        });
      } else {
        console.error('emoteClips is undefined!');
      }

      // Viseme poses
      console.debug(`createHost(${char.name}) - Animation: Viseme poses`);
      animationFeature.addLayer('Viseme', { transitionTime: 0.12, blendMode: LayerBlendModes.Additive });
      animationFeature.setLayerWeight('Viseme', 0);

      // Slice off the reference frame
      const blendStateOptions = lipsyncClips.map((clip: any) => {
        AnimationUtils.makeClipAdditive(clip);
        return {
          name: clip.name,
          clip: AnimationUtils.subclip(clip, clip.name, 1, 2, 30),
          weight: 0,
        };
      });
      animationFeature.addAnimation('Viseme', 'visemes', AnimationTypes.freeBlend, { blendStateOptions });
      animationFeature.playAnimation('Viseme', 'visemes');

      // POI poses
      console.debug(`createHost(${char.name}) - POI poses`);
      if (char.poiConfig) {
        Object.entries(char.poiConfig).forEach(([key, config]: [string, any]) => {
          animationFeature.addLayer(config.name, { blendMode: LayerBlendModes.Additive });

          if (config.blendStateOptions) {
            // Find each pose clip and make it additive
            config.blendStateOptions.forEach((clipConfig: any) => {
              // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
              const clip = poiClips.find((c: any) => c.name === clipConfig.clip)!;

              AnimationUtils.makeClipAdditive(clip);
              clipConfig.clip = AnimationUtils.subclip(clip, clip.name, 1, 2, 30);
            });
          } else {
            console.error('config.blendStateOptions is undefined!');
          }

          animationFeature.addAnimation(config.name, config.animation, AnimationTypes.blend2d, { ...config });
          animationFeature.playAnimation(config.name, config.animation);

          // Find and store reference objects
          config.reference = char.character?.getObjectByName(config.reference.replace(':', ''));
        });
      } else {
        console.error('poiConfig is undefined!');
      }

      // Apply bindPoseOffset clip if it exists
      if (char.bindPoseOffset !== undefined) {
        animationFeature.addLayer('BindPoseOffset', { blendMode: LayerBlendModes.Additive });
        animationFeature.addAnimation('BindPoseOffset', char.bindPoseOffset.name, AnimationTypes.single, { clip: AnimationUtils.subclip(char.bindPoseOffset, char.bindPoseOffset.name, 1, 2, 30) });
        animationFeature.playAnimation('BindPoseOffset', char.bindPoseOffset.name);
      }

      // Set up Lipsync
      console.debug(`createHost(${char.name}) - Set up Lipsync`);
      const visemeOptions = { layers: [{ name: 'Viseme', animation: 'visemes' }] };
      const talkingOptions = { layers: [{ name: 'Talk', animation: 'stand_talk', blendTime: 0.75, easingFn: Quadratic.InOut }] };
      host.addFeature(LipsyncFeature, false, visemeOptions, talkingOptions);

      // Set up Gestures
      console.debug(`createHost(${char.name}) - Set up Gestures`);
      host.addFeature(GestureFeature, false, { layers: { Gesture: { minimumInterval: 3 }, Emote: { blendTime: 0.5, easingFn: Quadratic.InOut } } });

      // Set up Point of Interest (POI)
      console.debug(`createHost(${char.name}) - Set up POI`);
      host.addFeature(
        PointOfInterestFeature,
        false,
        {
          target: this.camera,
          lookTracker: char.lookTracker,
          scene: this.scene,
        },
        {
          layers: char.poiConfig,
        },
        {
          layers: [{ name: 'Blink' }],
        }
      );

      return host;
    } catch (error) {
      console.debug(error);
      throw new Error(`createHost - ${error}`);
    }
  }

  async control(command: string, param?: string) {
    const name = this.currentCharacter.name;
    const host = this.currentCharacter.host;
    const text = this.currentCharacter.text;
    const emot = this.currentCharacter.emot;
    const language = name === 'Luke' ? 'en-US' : 'ru-RU';

    switch (command) {
      case 'Luke':
        this.currentCharacter = this.Characters[0];
        console.debug('Luke selected.');
        break;

      case 'Alien':
        this.currentCharacter = this.Characters[1];
        console.debug('Alien selected.');
        break;

      case 'play':
        console.debug('play audio.');
        await this.playPreprocessdAudio(name, language, host);
        break;

      case 'play_text':
        console.debug('play text to audio.');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // host.TextToSpeechFeature['play'](text);
        break;

      case 'pause':
        console.debug('pause audio.');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        host.TextToSpeechFeature[command](text);
        break;

      case 'resume':
        console.debug('resume audio.');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        host.TextToSpeechFeature[command](text);
        break;

      case 'stop':
        console.debug('stop audio.');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        host.TextToSpeechFeature[command](text);
        break;

      case 'emot':
        console.debug(`play emot.`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        host.GestureFeature.playGesture('Emote', emot);
        break;

      default:
        break;
    }
  }

  update() {
    this.renderFn.forEach((fn: any) => {
      fn();
    });
  }
}
