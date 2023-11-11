import * as THREE from "three";
import Experience from "../Experience";
import EventEmitter from "../utilities/EventEmitter";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      70,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.instance.position.set(0, 8, 8);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 25;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.15;
    // Disable everything, except zoom
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    // this.controls.enableZoom = true;
    // this.controls.enableRotate = false;
    this.controls.zoomSpeed = 0.5;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
