import Experience from "../core/Experience.js";
import * as THREE from "three";
import planeFragment from "./shaders/planeFragment.glsl";
import planeVertex from "./shaders/planeVertex.glsl";
export default class MainScene {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debugUI = this.experience.debug.ui;

    this.total = 48;
    this.torusSize = 4;
    this.torusResolution = 64;
    this.shellDistance = 0.05;
    this.shellLength = 1;

    this.density = 100;
    this.noiseMin = 1;
    this.noiseMax = 1;
    this.thickness = 0.5;
    this.attenuation = 1;
    this.occlusionBias = 0.5;
    this.shellDistanceAttenuation = 1;
    //b4e1b0
    this.shellColor = "#6E46AE";
    this.furLightColor = "#00B6B4";
    this.shellDirection = new THREE.Vector3(0, 1, 0);

    this.setTorus();
    this.setDebugUI();
  }

  setDebugUI() {
    if (!this.debugUI) return;

    const folder = this.debugUI.addFolder("Shell");
    folder
      .add(this, "shellLength", 0, 1)
      .step(0.0001)
      .onChange(() => {
        this.toruses.forEach((torus, index) => {
          torus.material.uniforms.shellLength.value = this.shellLength;
        });
      });
    folder
      .add(this, "shellDistance", 0, 1)
      .step(0.0001)
      .onChange(() => {
        this.toruses.forEach((torus, index) => {
          torus.position.setY(index * this.shellDistance);
        });
      });

    folder
      .add(this, "torusSize", 0, 10)
      .step(1)
      .onChange(() => {
        this.toruses.forEach((torus, index) => {
          torus.scale.set(this.torusSize, this.torusSize, this.torusSize);
        });
      });

    folder
      .add(this, "total", 0, 100)
      .step(1)
      .onChange(() => {
        this.toruses.forEach((torus, index) => {
          this.scene.remove(torus);
        });
        this.setTorus();
      });
    folder
      .add(this, "density", 0, 100)
      .step(1)
      .onChange(() => {
        this.toruses.forEach((torus) => {
          torus.material.uniforms.density.value = this.density;
        });
      });
    folder.add(this, "noiseMin", 0, 1).onChange(() => {
      this.toruses.forEach((torus) => {
        torus.material.uniforms.noiseMin.value = this.noiseMin;
      });
    });
    folder.add(this, "noiseMax", 0, 1).onChange(() => {
      this.toruses.forEach((torus) => {
        torus.material.uniforms.noiseMax.value = this.noiseMax;
      });
    });
    folder.add(this, "thickness", 0, 1).onChange(() => {
      this.toruses.forEach((torus) => {
        torus.material.uniforms.thickness.value = this.thickness;
      });
    });
    folder.add(this, "attenuation", 0, 1).onChange(() => {
      this.toruses.forEach((torus) => {
        torus.material.uniforms.attenuation.value = this.attenuation;
      });
    });
    folder.add(this, "occlusionBias", 0, 1).onChange(() => {
      this.toruses.forEach((torus) => {
        torus.material.uniforms.occlusionBias.value = this.occlusionBias;
      });
    });
    folder.add(this, "shellDistanceAttenuation", 0, 1).onChange(() => {
      this.toruses.forEach((torus) => {
        torus.material.uniforms.shellDistanceAttenuation.value =
          this.shellDistanceAttenuation;
      });
    });
  }

  setTorus() {
    this.toruses = [];
    for (let i = 0; i < this.total; i++) {
      const position = new THREE.Vector3(0, i * this.shellDistance, 0);
      const torus = this.createTorus(position, i);
      this.toruses.push(torus);
      this.scene.add(torus);
    }
  }
  createTorus(position, index) {
    const geometry = new THREE.TorusKnotGeometry(
      this.torusSize,
      this.torusSize / 3,
      this.torusResolution,
      this.torusResolution
    );
    const material = new THREE.RawShaderMaterial({
      fragmentShader: planeFragment,
      vertexShader: planeVertex,
      wireframe: false,
      side: THREE.DoubleSide,
      uniforms: {
        shellIndex: { type: "i", value: index },
        shellCount: { type: "i", value: this.total },
        shellLength: { type: "f", value: this.shellLength },
        density: { type: "f", value: this.density },
        noiseMin: { type: "f", value: this.noiseMin },
        noiseMax: { type: "f", value: this.noiseMax },
        thickness: { type: "f", value: this.thickness },
        attenuation: { type: "f", value: this.attenuation },
        occlusionBias: { type: "f", value: this.occlusionBias },
        shellDistanceAttenuation: {
          type: "f",
          value: this.shellDistanceAttenuation,
        },
        shellColor: {
          type: "c",
          value: new THREE.Color(this.shellColor),
        },
        furLightColor: {
          type: "c",
          value: new THREE.Color(this.furLightColor),
        },
        shellDirection: {
          type: "v3",
          value: this.shellDirection,
        },
        uTime: { type: "f", value: 0 },
        // Add any other uniforms you have in your shader
      },
    });
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.set(-Math.PI / 2, 0, 0);
    torus.position.copy(position);
    return torus;
  }

  update() {
    const elapsedTime = this.time.elapsed;
    this.toruses.forEach((torus) => {
      torus.material.uniforms.uTime.value = elapsedTime;
    });
  }
}
