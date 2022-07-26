import { AxesHelper, BoxGeometry, Color, DirectionalLight, Fog, HemisphereLight, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneBufferGeometry, PMREMGenerator, Scene, sRGBEncoding, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { Startup } from 'Startup';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

export class App {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private renderer: WebGLRenderer;
  private startup: Startup | undefined;
  private crate: Mesh | undefined;

  constructor() {
    // Camera
    this.camera = new PerspectiveCamera(MathUtils.radToDeg(0.8), window.innerWidth / window.innerHeight, 0.1, 1000);

    // Base scene
    this.scene = new Scene();

    // Renderer
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });

    // // *** Setup HCap VV ***
    // // Try to create WebGL2 context
    // const context = canvas.getContext('webgl2');

    // // WebGL2 not available, fall back to WebGL1
    // if (!context) {
    //   context = canvas.getContext('webgl');
    //   if (!context) {
    //     alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    //   }
    // }
    // // Construct THREE.WebGLRenderer using our new context:
    // const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, context: context });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.createScene();
    this.initializeCrate();
    this.initialize();
    this.animate();
  }

  private createScene() {
    try {
      console.debug('createScene()');

      // Camera
      this.camera.position.set(0, 1.4, 3.1);

      // Base scene
      this.scene.background = new Color(0x33334d);
      // this.scene.fog = new Fog(0x33334d, 0, 10);

      // Renderer
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputEncoding = sRGBEncoding;
      this.renderer.shadowMap.enabled = true;
      this.renderer.setClearColor(0x33334d);
      this.renderer.domElement.id = 'renderCanvas';

      // Axes Helper
      this.scene.add(new AxesHelper(1));

      document.body.appendChild(this.renderer.domElement);
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
      window.addEventListener('keydown', this.onKeydown.bind(this), false);

      // Env map
      new TextureLoader().setPath('assets/').load('images/machine_shop.jpg', (hdrEquirect) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect);

        hdrEquirect.dispose();
        pmremGenerator.dispose();
        this.scene.environment = hdrCubeRenderTarget.texture;
      });

      const pmremGenerator = new PMREMGenerator(this.renderer);

      pmremGenerator.compileEquirectangularShader();

      // Controls
      this.controls.target = new Vector3(0, 0.8, 0);
      this.controls.screenSpacePanning = true;
      this.controls.update();

      // Lights
      const hemiLight = new HemisphereLight(0xffffff, 0x000000, 0.6);

      hemiLight.position.set(0, 1, 0);
      hemiLight.intensity = 0.6;
      this.scene.add(hemiLight);

      const dirLight = new DirectionalLight(0xffffff);

      dirLight.position.set(0, 5, 5);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.top = 2.5;
      dirLight.shadow.camera.bottom = -2.5;
      dirLight.shadow.camera.left = -2.5;
      dirLight.shadow.camera.right = 2.5;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 40;
      this.scene.add(dirLight);

      const dirLightTarget = new Object3D();

      dirLight.add(dirLightTarget);
      dirLightTarget.position.set(0, -0.5, -1.0);
      dirLight.target = dirLightTarget;

      // Environment
      const groundMat = new MeshStandardMaterial({ color: 0x808080, depthWrite: false });

      groundMat.metalness = 0;
      groundMat.refractionRatio = 0;
      const ground = new Mesh(new PlaneBufferGeometry(100, 100), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);
    } catch (error) {
      console.debug(error);
      throw new Error(`createScene - ${error}`);
    }
  }

  private async initialize() {
    try {
      this.startup = new Startup(this.scene, this.camera, this.renderer);
      await this.startup.initialize();
    } catch (error) {
      console.debug(error);
      throw new Error(`initialize - ${error}`);
    }
  }

  private initializeCrate() {
    // Create
    const texture = new TextureLoader().load('assets/images/textures/crate.gif');
    const geometry = new BoxGeometry(0.2, 0.2, 0.2);
    const material = new MeshBasicMaterial({ map: texture });

    this.crate = new Mesh(geometry, material);
    this.crate.position.set(0, .5, .2);
    this.scene.add(this.crate);

    this.createUI();
  }

  private createUI() {
    const gui = new GUI();
    const cubeFolder = gui.addFolder('Cube');

    if (this.crate) {
      cubeFolder.add(this.crate.position, 'x', -1, 1);
      cubeFolder.add(this.crate.position, 'y', 0.1, 2);
      cubeFolder.add(this.crate.position, 'z', -0.5, 0.5);
      cubeFolder.open();
    }

    const cameraFolder = gui.addFolder('Camera');

    cameraFolder.add(this.camera.position, 'z', 0.3, 2);
    cameraFolder.open();
  }

  private onKeydown(event: KeyboardEvent) {
    if (this.startup) {
      switch (event.code) {
        case 'KeyL':
          this.startup.control('Luke');
          break;

        case 'KeyA':
          this.startup.control('Alien');
          break;

        case 'KeyP':
          if (event.shiftKey) {
            this.startup.control('pause');
          } else {
            this.startup.control('play');
          }
          break;

        case 'KeyT':
          this.startup.control('play_text');
          break;

        case 'KeyR':
          this.startup.control('resume');
          break;

        case 'KeyS':
          this.startup.control('stop');
          break;

        case 'KeyE':
          this.startup.control('emot');
          break;

        default:
          break;
      }
    }
  }

  private updateCrate() {
    if (this.crate) {
      this.crate.rotation.x += 0.005;
      this.crate.rotation.y += 0.01;
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    this.updateCrate();
    if (this.startup) {
      this.startup.update();
    }

    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }
}

// tslint:disable-next-line: no-unused-expression
new App();
