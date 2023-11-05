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

    this.total = 32;
    this.planeSize = 5;
    this.planeResolution = 32;
    this.shellDistance = 0;
    this.shellLength = 0.4;

    this.density = 32;
    this.noiseMin = 1;
    this.noiseMax = 1;
    this.thickness = 0.3;
    this.attenuation = 1;
    this.occlusionBias = 0.15;
    this.shellDistanceAttenuation = 0.8;
    //b4e1b0
    this.shellColor = "#b4e1b0";
    this.shellDirection = new THREE.Vector3(0, 1, 0);

    this.setPlanes();
    this.setDebugUI();
  }

  setDebugUI() {
    if (!this.debugUI) return;

    const folder = this.debugUI.addFolder("Shell");
    folder
      .add(this, "shellLength", 0, 1)
      .step(0.0001)
      .onChange(() => {
        this.planes.forEach((plane, index) => {
          plane.material.uniforms.shellLength.value = this.shellLength;
        });
      });
    folder
      .add(this, "shellDistance", 0, 1)
      .step(0.0001)
      .onChange(() => {
        this.planes.forEach((plane, index) => {
          plane.position.setY(index * this.shellDistance);
        });
      });

    folder
      .add(this, "planeSize", 0, 10)
      .step(1)
      .onChange(() => {
        this.planes.forEach((plane, index) => {
          plane.scale.set(this.planeSize, this.planeSize, this.planeSize);
        });
      });

    folder
      .add(this, "total", 0, 100)
      .step(1)
      .onChange(() => {
        this.planes.forEach((plane, index) => {
          this.scene.remove(plane);
        });
        this.setPlanes();
      });
    folder
      .add(this, "density", 0, 100)
      .step(1)
      .onChange(() => {
        this.planes.forEach((plane) => {
          plane.material.uniforms.density.value = this.density;
        });
      });
    folder.add(this, "noiseMin", 0, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.noiseMin.value = this.noiseMin;
      });
    });
    folder.add(this, "noiseMax", 0, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.noiseMax.value = this.noiseMax;
      });
    });
    folder.add(this, "thickness", 0, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.thickness.value = this.thickness;
      });
    });
    folder.add(this, "attenuation", 0, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.attenuation.value = this.attenuation;
      });
    });
    folder.add(this, "occlusionBias", 0, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.occlusionBias.value = this.occlusionBias;
      });
    });
    folder.add(this, "shellDistanceAttenuation", 0, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.shellDistanceAttenuation.value =
          this.shellDistanceAttenuation;
      });
    });

    folder.add(this.shellDirection, "x", -1, 1).onChange(() => {
      this.planes.forEach((plane) => {
        plane.material.uniforms.shellDirection.value = this.shellDirection;
      });
    });
  }

  setPlanes() {
    this.planes = [];
    for (let i = 0; i < this.total; i++) {
      const position = new THREE.Vector3(0, i * this.shellDistance, 0);
      const plane = this.createPlane(position, i);
      this.planes.push(plane);
      this.scene.add(plane);
    }
  }
  createPlane(position, index) {
    const geometry = new THREE.CircleGeometry(
      this.planeSize,
      this.planeResolution
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
        shellDirection: {
          type: "v3",
          value: this.shellDirection,
        },
        uTime: { type: "f", value: 0 },
        // Add any other uniforms you have in your shader
      },
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.position.copy(position);
    return plane;
  }

  update() {
    const elapsedTime = this.time.elapsed;
    this.planes.forEach((plane) => {
      plane.material.uniforms.uTime.value = elapsedTime;
    });
  }
}
