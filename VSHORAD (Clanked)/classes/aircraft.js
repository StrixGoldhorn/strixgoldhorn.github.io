import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader.min.js";
import { OBB } from "../modules/OBB.js";

export class Aircraft {
    constructor(scene, worldSettings, uiElements) {
        this.scene = scene;
        this.worldSettings = worldSettings;
        this.uiElements = uiElements;
        
        this.t = 0;
        this.hit = false;
        this.aircraftMesh = null;
        this.obb = new OBB();
        
        this.tlGeometry = new THREE.BufferGeometry();
        this.tlMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 1 });
        this.tlMesh = new THREE.Line(this.tlGeometry, this.tlMaterial);
        this.scene.add(this.tlMesh);
        
        this.halfSize = new THREE.Vector3(10, 10, 10);
        this.pt = new THREE.Vector3();
        this.mesh = null;
        
        this.load();
    }

    load() {
        const loader = new GLTFLoader();
        const path = window.innerWidth <= 1000 ? "assets/c130_(EXPORT MIN).glb" : "assets/c130_(EXPORT).glb";
        loader.load(path, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.name = "c130Mesh";
            this.scene.add(this.mesh);
            this.mesh.position.set(0, 20, 0);
            this.aircraftMesh = this.mesh.children[0] || this.mesh;
            if (this.aircraftMesh && this.aircraftMesh.geometry) {
                this.aircraftMesh.geometry.computeBoundingBox();
            }
        });
    }

    update(delta) {
        if (this.hit || !this.aircraftMesh) return;

        const c130Mesh = this.aircraftMesh;

        const step = (delta !== undefined && delta > 0) ? this.worldSettings.c130.gndspeed * (delta * 60) : this.worldSettings.c130.gndspeed;
        this.t += step;
        c130Mesh.position.x = this.worldSettings.c130.pathx * Math.cos(this.t);
        c130Mesh.position.z = this.worldSettings.c130.pathy * Math.sin(this.t);
        c130Mesh.position.y = this.worldSettings.c130.agl + this.worldSettings.c130.zamp * Math.sin(this.worldSettings.c130.zperiod * this.t) ** 2;

        c130Mesh.lookAt(0, 0, 0);
        c130Mesh.rotateX(Math.PI / 8);

        this.obb.center.set(0, 0, 0);
        this.obb.halfSize.copy(this.halfSize);
        this.obb.rotation.identity();
        this.obb.applyMatrix4(c130Mesh.matrixWorld);
        c130Mesh.userData.obb = this.obb;

        if (this.worldSettings.c130.c130trackline === true) {
            if (this.trackLine.length > 500 && this.worldSettings.c130.tracklineAutoLength === true) {
                this.trackLine.shift();
            }
            c130Mesh.getWorldPosition(this.pt);
            this.trackLine.push(this.pt.clone());
            this.tlGeometry.setFromPoints(this.trackLine);
            this.tlMesh.visible = true;
        } else {
            this.trackLine = [];
            this.tlGeometry.setFromPoints(this.trackLine);
            this.tlMesh.visible = false;
        }
    }

    hitcam(camera, controls) {
        if (!this.aircraftMesh) return;
        const c130Mesh = this.aircraftMesh;
        const c130pcam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
        c130pcam.position.set(c130Mesh.position.x, c130Mesh.position.y + 2, c130Mesh.position.z);
        
        camera.position.set(c130Mesh.position.x, c130Mesh.position.y + 50, c130Mesh.position.z);
        controls.target.set(c130Mesh.position.x, c130Mesh.position.y + 20, c130Mesh.position.z);
    }

    reset() {
        this.hit = false;
        this.t = 0;
        this.trackLine = [];
        this.tlGeometry.setFromPoints(this.trackLine);
        this.tlMesh.visible = false;
    }
}