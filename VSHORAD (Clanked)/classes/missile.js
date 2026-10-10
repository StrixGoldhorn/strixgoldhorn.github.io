import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader.min.js";

export class Missile {
    constructor(scene, worldSettings, camera, controls, aircraft, launcher, uiElements, clock) {
        this.scene = scene;
        this.worldSettings = worldSettings;
        this.camera = camera;
        this.controls = controls;
        this.aircraft = aircraft;
        this.launcher = launcher;
        this.uiElements = uiElements;
        this.clock = clock;
        
        this.mesh = null;
        this.fuseMesh = null;
        this.light = new THREE.PointLight(0xcca412, 6, 1, 1);
        this.light.position.set(0, -50, 0);
        
        this.trackLine = [new THREE.Vector3(0, 2, 0)];
        this.tlCount = 0;
        this.tlMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 1 });
        this.tlGeometry = new THREE.BufferGeometry().setFromPoints(this.trackLine);
        this.tlMesh = new THREE.Line(this.tlGeometry, this.tlMaterial);
        
        this.box = new THREE.Box3();
        
        this.fired = false;
        this.shotout = false;
        this.shotend = false;
        this.inFlight = false;
        
        this.currDist = 0;
        this.currSpeed = 50;
        this.currAccel = worldSettings.missile["accel factor"];
        this.speedClock = new THREE.Clock(false);
        this.rotateAnim = 0;
        
        this.alignVec = new THREE.Vector3();
        this.focalVec = new THREE.Vector3();
        this.longFocal = new THREE.Vector3();
        this.missilePt = new THREE.Vector3();
        
        this.missileMixer = null;
        this.animActions = [];
        this.load();
    }

    load() {
        const loader = new GLTFLoader();
        const path = window.innerWidth <= 1000 ? "assets/rbs70missile_scaled_1_5 (MIN).glb" : "assets/rbs70missile_scaled_1_5_(EXPORT).glb";
        loader.load(path, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(this.mesh.scale.x * 0.1, this.mesh.scale.y * 0.1, this.mesh.scale.z * 0.1);
            this.mesh.position.set(0, 2, 0);
            this.mesh.name = "MissileMesh";
            this.mesh.visible = this.inFlight;
            this.scene.add(this.mesh);

            this.fuseMesh = this.mesh.getObjectByName("Fuse") || (this.mesh.children && this.mesh.children.find(obj => obj.name === "Fuse"));
            if (this.fuseMesh && this.fuseMesh.geometry) {
                this.fuseMesh.geometry.computeBoundingBox();
            }

            if (window.innerWidth > 1000) {
                this.missileMixer = new THREE.AnimationMixer(gltf.scene);
                this.animActions = [];
                gltf.animations.forEach((iclip) => {
                    const finDeploy = this.missileMixer.clipAction(iclip);
                    finDeploy.clampWhenFinished = true;
                    finDeploy.loop = THREE.LoopOnce;
                    this.animActions.push(finDeploy);
                });
            }
        });
    }

    getDistance(u) {
        if (u > 686) this.currAccel = -10;
        const a = this.currAccel;
        const t = this.speedClock.getDelta();
        const s = u * t + 0.5 * a * t * t;
        this.currSpeed = u + a * t;
        return s;
    }

    fire() {
        if (this.fired || this.shotout) {
            console.log("- ! - No munition");
            this.uiElements.loadIndicate.style.background = "#dd2222";
            this.uiElements.loadIndicate.innerText = "Empty";
            this.uiElements.loadIndicate.style.color = "white";
            return;
        }

        if (this.launcher.caged) {
            console.log("- ! - CAGED, Cannot fire");
            this.uiElements.alertDoc.innerText = "Uncage to fire!";
            this.uiElements.alertDoc.style.opacity = "1";
            this.uiElements.alertDoc.style.background = "#dd2222";
            return;
        }

        if (!this.shotend) {
            this.fired = true;
            if (this.mesh) {
                this.mesh.position.set(0, 2, 0);
                this.mesh.rotation.set(0, 0, 0);
                this.mesh.visible = true;
            }
            this.scene.add(this.light);
            this.light.intensity = 10;
            this.shotout = true;
            this.inFlight = true;
            console.log("- ^ - Missile fired");

            if (this.missileMixer && this.animActions.length > 0) {
                this.missileMixer.timeScale = 10;
                this.animActions.forEach(action => {
                    action.reset();
                    action.play();
                });
            }

            this.uiElements.loadIndicate.style.background = "yellow";
            this.uiElements.loadIndicate.innerText = "In-Flight";
            this.uiElements.loadIndicate.style.color = "black";
            
            this.uiElements.alertDoc.innerText = "";
            this.uiElements.alertDoc.style.opacity = "0";
            this.speedClock.start();
        }
    }

    update(delta) {
        if (!this.inFlight || this.shotend) return;
        if (!this.mesh) return;

        if (this.missileMixer) {
            this.missileMixer.update(delta);
        }

        const MissileMesh = this.mesh;

        if (this.worldSettings.operator.showStats) {
            this.uiElements.tempCross.innerHTML = "------ <br /> " + ("000" + Math.round(this.currSpeed)).slice(-4) + " | + | " + ("000" + Math.round(parseFloat(this.currDist / 10).toFixed(4))).slice(-3) + "0<br />------";
        }

        this.camera.getWorldDirection(this.focalVec);
        this.longFocal.copy(this.focalVec);
        this.focalVec.normalize();
        this.focalVec.multiplyScalar(this.currDist);
        this.focalVec.setY(this.focalVec.y + 2);

        this.currDist += this.getDistance(this.currSpeed);

        MissileMesh.position.set(this.focalVec.x, this.focalVec.y, this.focalVec.z);
        MissileMesh.getWorldPosition(this.missilePt);
        MissileMesh.lookAt(this.longFocal.multiplyScalar(10000));

        MissileMesh.rotateZ(this.rotateAnim * (Math.PI / 180));
        this.rotateAnim += 2;
        MissileMesh.updateMatrixWorld();

        this.light.position.set(this.focalVec.x - 0.5, this.focalVec.y, this.focalVec.z);

        if (this.fuseMesh && this.fuseMesh.geometry && this.fuseMesh.geometry.boundingBox) {
            this.box.copy(this.fuseMesh.geometry.boundingBox).applyMatrix4(this.fuseMesh.matrixWorld);
        } else {
            this.box.setFromCenterAndSize(this.missilePt, new THREE.Vector3(1, 1, 1));
        }
        this.box.expandByScalar(this.worldSettings.missile.proxFuse);

        if (this.tlCount === 5) {
            this.trackLine.push(this.missilePt.clone());
            this.tlCount = 0;
        } else {
            this.tlCount += 1;
        }

        const c130Mesh = this.aircraft.aircraftMesh;
        if (c130Mesh && c130Mesh.userData.obb && c130Mesh.userData.obb.intersectsBox3(this.box)) {
            this.light.intensity = 10;
            this.light.distance = 10;
            this.shotend = true;
            this.inFlight = false;
            console.log("- - - SUCCESSFUL HIT - - -");

            this.uiElements.tempCross.innerHTML = "------ <br />| HIT | <br />------";
            
            this.trackLine.push(this.missilePt.clone());
            this.tlGeometry.setFromPoints(this.trackLine);
            if (!this.tlMesh.parent) {
                this.scene.add(this.tlMesh);
            }

            this.aircraft.hit = true;
            this.aircraft.hitcam(this.camera, this.controls);
            
            this.controls.enablePan = true;
            this.controls.enableZoom = true;

            this.camera.setFocalLength(this.worldSettings.operator.normal.focalLength);
            this.controls.dampingFactor = this.worldSettings.operator.normal.dampingFactor;
            
            this.controls.maxPolarAngle = Math.PI;
            this.controls.minPolarAngle = 0;

            this.controls.update();
            return;
        }

        if (Math.round(this.missilePt.length()) > 9000 || Math.round(MissileMesh.position.y) > 5500) {
            this.shotend = true;
            this.inFlight = false;
            console.log("- ! - Max Range Exceeded");
            this.tlGeometry.setFromPoints(this.trackLine);
            if (!this.tlMesh.parent) {
                this.scene.add(this.tlMesh);
            }
            
            this.uiElements.tempCross.innerHTML = "------ <br />|-=!=-|<br />------";
            this.uiElements.alertDoc.innerText = "Max Range";
            this.uiElements.alertDoc.style.opacity = "1";
            this.uiElements.alertDoc.style.background = "#dd2222";
        }
    }

    reset() {
        this.inFlight = false;
        this.shotout = false;
        this.fired = false;
        this.shotend = false;
        this.currDist = 0;
        this.currSpeed = 50;
        this.currAccel = this.worldSettings.missile["accel factor"];
        this.speedClock.stop();
        this.rotateAnim = 0;

        this.trackLine.length = 0;
        this.trackLine.push(new THREE.Vector3(0, 2, 0));
        this.tlGeometry.setFromPoints(this.trackLine);
        if (this.tlMesh && this.tlMesh.parent) this.scene.remove(this.tlMesh);

        if (this.mesh) {
            this.mesh.visible = false;
            this.mesh.position.set(0, 2, 0);
            this.mesh.rotation.set(0, 0, 0);
        }
        if (this.missileMixer && this.animActions) {
            this.animActions.forEach(action => action.stop());
        }

        this.scene.remove(this.light);
        console.log("--- Missile reset ---");

        this.uiElements.loadIndicate.style.background = "#22cc55";
        this.uiElements.loadIndicate.innerText = "Loaded";
        this.uiElements.loadIndicate.style.color = "white";

        this.uiElements.tempCross.innerHTML = "------ <br /> | + | <br />------";
    }
}