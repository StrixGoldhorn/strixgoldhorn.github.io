import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader.min.js";

export class Launcher {
    constructor(scene, camera, controls, worldSettings) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.worldSettings = worldSettings;
        
        this.weaponMesh = null;
        this.standMesh = null;
        this.seatMesh = null;
        this.caged = true;
        
        this.alignVec = new THREE.Vector3();
        this.focalWpn = new THREE.Vector3();
        this.focalSeat = new THREE.Vector3();
        
        this.load();
    }

    load() {
        const loader = new GLTFLoader();
        const wpnpath = window.innerWidth <= 1000 ? "assets/rbs70_WEAPON_scaled_1_5_(MIN).glb" : "assets/rbs70_WEAPON_scaled_1_5_(EXPORT).glb";
        loader.load(wpnpath, (gltf) => {
            this.weaponMesh = gltf.scene;
            this.weaponMesh.scale.set(this.weaponMesh.scale.x * 0.2, this.weaponMesh.scale.y * 0.2, this.weaponMesh.scale.z * 0.2);
            this.weaponMesh.position.set(0, 1.8, 0);
            this.weaponMesh.name = "WeaponMesh";
            this.scene.add(this.weaponMesh);
        });

        const standpath = window.innerWidth <= 1000 ? "assets/rbs70_STAND_scaled_1_5_(MIN).glb" : "assets/rbs70_STAND_scaled_1_5_(EXPORT).glb";
        loader.load(standpath, (gltf) => {
            this.standMesh = gltf.scene;
            this.standMesh.scale.set(this.standMesh.scale.x * 0.2, this.standMesh.scale.y * 0.2, this.standMesh.scale.z * 0.2);
            this.standMesh.name = "StandMesh";
            this.scene.add(this.standMesh);
        });

        loader.load("assets/rbs70_SEAT_scaled_1_5_(EXPORT).glb", (gltf) => {
            this.seatMesh = gltf.scene;
            this.seatMesh.scale.set(this.seatMesh.scale.x * 0.2, this.seatMesh.scale.y * 0.2, this.seatMesh.scale.z * 0.2);
            this.seatMesh.name = "SeatMesh";
            this.scene.add(this.seatMesh);
        });
    }

    rotate() {
        if (!this.weaponMesh || !this.seatMesh) return;
        
        this.focalWpn.set(
            this.weaponMesh.position.x + this.camera.getWorldDirection(this.alignVec).x,
            this.weaponMesh.position.y + this.camera.getWorldDirection(this.alignVec).y,
            this.weaponMesh.position.z + this.camera.getWorldDirection(this.alignVec).z,
        );
        this.focalSeat.set(
            this.seatMesh.position.x + this.camera.getWorldDirection(this.alignVec).x,
            this.seatMesh.position.y,
            this.seatMesh.position.z + this.camera.getWorldDirection(this.alignVec).z,
        );
        
        this.weaponMesh.lookAt(this.focalWpn);
        this.seatMesh.lookAt(this.focalSeat);
        requestAnimationFrame(() => this.rotate());
    }

    setCaged(caged) {
        this.caged = caged;
        const cageNotify = document.getElementById("cage");
        if (!cageNotify) return;
        if (caged) {
            cageNotify.innerText = "-CAGED-";
            cageNotify.style.background = "#dd2222";
        } else {
            cageNotify.innerText = "UNCAGED";
            cageNotify.style.background = "#22cc55";
        }
    }
}