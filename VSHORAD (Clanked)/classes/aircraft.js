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
        this.fuseOBB = new OBB();
        this.wingOBB = new OBB();
        
        // Compound hitbox: test fuselage and wings separately for realistic conformity
        this.obb.intersectsBox3 = (box3) => {
            return this.fuseOBB.intersectsBox3(box3) || this.wingOBB.intersectsBox3(box3);
        };
        
        this.tlGeometry = new THREE.BufferGeometry();
        this.tlMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 1 });
        this.tlMesh = new THREE.Line(this.tlGeometry, this.tlMaterial);
        this.scene.add(this.tlMesh);
        
        this.fuseLocalCenter = new THREE.Vector3(-0.75, 1.5, 0);
        this.fuseLocalHalfSize = new THREE.Vector3(10.1, 3.9, 1.5);
        this.wingLocalCenter = new THREE.Vector3(-2.7, 0.1, 0);
        this.wingLocalHalfSize = new THREE.Vector3(6.5, 0.8, 13.8);
        this.overallLocalCenter = new THREE.Vector3(-0.75, 1.5, 0);
        this.overallLocalHalfSize = new THREE.Vector3(10.1, 3.9, 13.8);
        
        this.pt = new THREE.Vector3();
        this.mesh = null;
        
        this.velocity = new THREE.Vector3();
        this.fwd = new THREE.Vector3();
        this.worldUp = new THREE.Vector3(0, 1, 0);
        this.rLevel = new THREE.Vector3();
        this.uLevel = new THREE.Vector3();
        this.rVec = new THREE.Vector3();
        this.uVec = new THREE.Vector3();
        this.rotMatrix = new THREE.Matrix4();
        
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
                const geomBox = this.aircraftMesh.geometry.boundingBox;
                geomBox.getCenter(this.overallLocalCenter);
                geomBox.getSize(this.overallLocalHalfSize).multiplyScalar(0.5);

                const pos = this.aircraftMesh.geometry.attributes.position;
                if (pos && pos.count > 0) {
                    let minZ = Infinity, maxZ = -Infinity;
                    for (let i = 0; i < pos.count; i++) {
                        const z = pos.getZ(i);
                        if (z < minZ) minZ = z;
                        if (z > maxZ) maxZ = z;
                    }
                    const fuseHalfWidth = (maxZ - minZ) * 0.1;

                    let fMinX = Infinity, fMaxX = -Infinity, fMinY = Infinity, fMaxY = -Infinity, fMinZ = Infinity, fMaxZ = -Infinity;
                    let wMinX = Infinity, wMaxX = -Infinity, wMinY = Infinity, wMaxY = -Infinity, wMinZ = Infinity, wMaxZ = -Infinity;

                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i);
                        const y = pos.getY(i);
                        const z = pos.getZ(i);
                        if (Math.abs(z) <= fuseHalfWidth) {
                            if (x < fMinX) fMinX = x; if (x > fMaxX) fMaxX = x;
                            if (y < fMinY) fMinY = y; if (y > fMaxY) fMaxY = y;
                            if (z < fMinZ) fMinZ = z; if (z > fMaxZ) fMaxZ = z;
                        } else {
                            if (x < wMinX) wMinX = x; if (x > wMaxX) wMaxX = x;
                            if (y < wMinY) wMinY = y; if (y > wMaxY) wMaxY = y;
                            if (z < wMinZ) wMinZ = z; if (z > wMaxZ) wMaxZ = z;
                        }
                    }

                    this.fuseLocalCenter.set((fMinX + fMaxX) / 2, (fMinY + fMaxY) / 2, (fMinZ + fMaxZ) / 2);
                    this.fuseLocalHalfSize.set((fMaxX - fMinX) / 2, (fMaxY - fMinY) / 2, (fMaxZ - fMinZ) / 2);

                    this.wingLocalCenter.set((wMinX + wMaxX) / 2, (wMinY + wMaxY) / 2, (wMinZ + wMaxZ) / 2);
                    this.wingLocalHalfSize.set((wMaxX - wMinX) / 2, (wMaxY - wMinY) / 2, (wMaxZ - wMinZ) / 2);
                }
            }
        });
    }

    update(delta) {
        if (this.hit || !this.aircraftMesh) return;

        const c130Mesh = this.aircraftMesh;

        const step = (delta !== undefined && delta > 0) ? this.worldSettings.c130.gndspeed * (delta * 60) : this.worldSettings.c130.gndspeed;
        this.t += step;
        const pathx = this.worldSettings.c130.pathx;
        const pathy = this.worldSettings.c130.pathy;
        const zamp = this.worldSettings.c130.zamp;
        const zperiod = this.worldSettings.c130.zperiod;

        c130Mesh.position.x = pathx * Math.cos(this.t);
        c130Mesh.position.z = pathy * Math.sin(this.t);
        c130Mesh.position.y = this.worldSettings.c130.agl + zamp * Math.sin(zperiod * this.t) ** 2;

        // Tangent flight velocity vector d/dt [position]
        const vx = -pathx * Math.sin(this.t);
        const vz = pathy * Math.cos(this.t);
        const vy = 2 * zamp * zperiod * Math.sin(zperiod * this.t) * Math.cos(zperiod * this.t);

        this.velocity.set(vx, vy, vz);
        this.fwd.copy(this.velocity).normalize();

        // Level right vector and level up vector
        this.rLevel.crossVectors(this.fwd, this.worldUp).normalize();
        this.uLevel.crossVectors(this.rLevel, this.fwd).normalize();

        // Bank angle into turn: base angle ~22.5 deg (PI/8) scaled dynamically with ellipse curvature
        const denom = Math.sqrt(pathx * pathx * Math.sin(this.t) ** 2 + pathy * pathy * Math.cos(this.t) ** 2);
        const curvatureScale = denom > 0.001 ? Math.sqrt((pathx * pathy) / (denom * denom)) : 1;
        const phi = Math.min(Math.max((Math.PI / 8) * curvatureScale, 0.15), 0.55);

        // Banked right and up vectors (rolling around forward axis)
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        this.rVec.copy(this.rLevel).multiplyScalar(cosPhi).addScaledVector(this.uLevel, -sinPhi);
        this.uVec.copy(this.rLevel).multiplyScalar(sinPhi).addScaledVector(this.uLevel, cosPhi);

        // Build rotation matrix from basis: X=Forward, Y=Up, Z=Right
        this.rotMatrix.makeBasis(this.fwd, this.uVec, this.rVec);
        c130Mesh.quaternion.setFromRotationMatrix(this.rotMatrix);

        c130Mesh.updateMatrixWorld();

        // Update Fuselage OBB
        this.fuseOBB.halfSize.copy(this.fuseLocalHalfSize);
        this.fuseOBB.rotation.identity();
        this.fuseOBB.applyMatrix4(c130Mesh.matrixWorld);
        this.fuseOBB.center.copy(this.fuseLocalCenter).applyMatrix4(c130Mesh.matrixWorld);

        // Update Wings OBB
        this.wingOBB.halfSize.copy(this.wingLocalHalfSize);
        this.wingOBB.rotation.identity();
        this.wingOBB.applyMatrix4(c130Mesh.matrixWorld);
        this.wingOBB.center.copy(this.wingLocalCenter).applyMatrix4(c130Mesh.matrixWorld);

        // Update overall bounding OBB
        this.obb.halfSize.copy(this.overallLocalHalfSize);
        this.obb.rotation.identity();
        this.obb.applyMatrix4(c130Mesh.matrixWorld);
        this.obb.center.copy(this.overallLocalCenter).applyMatrix4(c130Mesh.matrixWorld);

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