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
        this.trackLine = [];
        this.tlGeometry = new THREE.BufferGeometry();
        this.tlMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 1 });
        this.tlMesh = null;
        
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
            this.animate();
        });
    }

    animate() {
        if (this.hit) return;

        const c130Mesh = this.scene.children.find(obj => obj.name === "c130Mesh").children[0];
        if (!c130Mesh) return;
        c130Mesh.geometry.computeBoundingBox();

        this.t += this.worldSettings.c130.gndspeed;
        c130Mesh.position.x = this.worldSettings.c130.pathx * Math.cos(this.t);
        c130Mesh.position.z = this.worldSettings.c130.pathy * Math.sin(this.t);
        c130Mesh.position.y = this.worldSettings.c130.agl + this.worldSettings.c130.zamp * Math.sin(this.worldSettings.c130.zperiod * this.t) ** 2;

        c130Mesh.lookAt(0, 0, 0);
        c130Mesh.rotateX(Math.PI / 8);

        c130Mesh.userData.obb = new OBB();
        c130Mesh.userData.obb.applyMatrix4(c130Mesh.matrixWorld);
        c130Mesh.userData.obb.halfSize = this.halfSize;

        if (this.worldSettings.c130.c130trackline === true) {
            if (this.trackLine.length > 500 && this.worldSettings.c130.tracklineAutoLength === true) {
                this.trackLine.shift();
            }
            if (this.tlMesh) this.scene.remove(this.tlMesh);
            c130Mesh.getWorldPosition(this.pt);
            this.trackLine.push(this.pt.clone());
            this.tlGeometry.setFromPoints(this.trackLine);
            this.tlMesh = new THREE.Line(this.tlGeometry, this.tlMaterial);
            this.tlGeometry.dispose();
            this.scene.add(this.tlMesh);
        } else {
            this.trackLine = [];
        }

        requestAnimationFrame(() => this.animate());
    }

    hitcam(camera, controls) {
        const c130pcam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
        const c130Mesh = this.scene.children.find(obj => obj.name === "c130Mesh").children[0];
        c130pcam.position.set(c130Mesh.position.x, c130Mesh.position.y + 2, c130Mesh.position.z);
        
        camera.position.set(c130Mesh.position.x, c130Mesh.position.y + 50, c130Mesh.position.z);
        controls.target.set(c130Mesh.position.x, c130Mesh.position.y + 20, c130Mesh.position.z);
    }

    reset() {
        this.hit = false;
        this.t = 0;
        this.trackLine = [];
        this.animate();
    }
}