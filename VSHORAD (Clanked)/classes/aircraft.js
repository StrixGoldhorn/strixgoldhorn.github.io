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
        this.stabOBB = new OBB();
        
        // Compound hitbox: test fuselage, wings, and horizontal stabilizer separately
        this.obb.intersectsBox3 = (box3) => {
            return this.fuseOBB.intersectsBox3(box3) || this.wingOBB.intersectsBox3(box3) || this.stabOBB.intersectsBox3(box3);
        };
        
        this.tlGeometry = new THREE.BufferGeometry();
        this.tlMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 1 });
        this.tlMesh = new THREE.Line(this.tlGeometry, this.tlMaterial);
        this.scene.add(this.tlMesh);
        this.trackLine = [];
        
        this.fuseLocalCenter = new THREE.Vector3(-0.75, 1.5, 0);
        this.fuseLocalHalfSize = new THREE.Vector3(10.1, 3.9, 1.5);
        this.wingLocalCenter = new THREE.Vector3(1.05, 0.08, 0);
        this.wingLocalHalfSize = new THREE.Vector3(2.69, 0.74, 13.8);
        this.stabLocalCenter = new THREE.Vector3(-8.54, 0.42, 0);
        this.stabLocalHalfSize = new THREE.Vector3(0.63, 0.16, 5.59);
        this.overallLocalCenter = new THREE.Vector3(-0.75, 1.5, 0);
        this.overallLocalHalfSize = new THREE.Vector3(10.1, 3.9, 13.8);
        this.halfSize = this.overallLocalHalfSize;
        
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
        
        // Pre-allocated scratch objects for zero-allocation collision queries
        this._clampedPt = new THREE.Vector3();
        this._segVec = new THREE.Vector3();
        this._rayDir = new THREE.Vector3();
        this._ray = new THREE.Ray();
        this._hitPt = new THREE.Vector3();
        this._clampTestPt = new THREE.Vector3();
        this._obbSize = new THREE.Vector3();
        this._zeroVec = new THREE.Vector3(0, 0, 0);
        this._expandedAABB = new THREE.Box3();
        this._obbMatrix = new THREE.Matrix4();
        this._invOBBMatrix = new THREE.Matrix4();
        this._localRay = new THREE.Ray();
        this._localHitPt = new THREE.Vector3();
        
        this.load();
    }

    load() {
        const loader = new GLTFLoader();
        const path = window.innerWidth <= 1000 ? "assets/c130_(EXPORT MIN).glb" : "assets/c130_(EXPORT).glb";
        loader.load(path, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.name = "c130Mesh";
            this.scene.add(this.mesh);
            this.mesh.position.set(0, 0, 0);
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

                    let outMinX = Infinity, outMaxX = -Infinity;
                    for (let i = 0; i < pos.count; i++) {
                        const z = pos.getZ(i);
                        if (Math.abs(z) > fuseHalfWidth) {
                            const x = pos.getX(i);
                            if (x < outMinX) outMinX = x;
                            if (x > outMaxX) outMaxX = x;
                        }
                    }
                    const splitX = outMinX + (outMaxX - outMinX) * 0.35;

                    let fMinX = Infinity, fMaxX = -Infinity, fMinY = Infinity, fMaxY = -Infinity, fMinZ = Infinity, fMaxZ = -Infinity;
                    let wMinX = Infinity, wMaxX = -Infinity, wMinY = Infinity, wMaxY = -Infinity, wMinZ = Infinity, wMaxZ = -Infinity;
                    let tMinX = Infinity, tMaxX = -Infinity, tMinY = Infinity, tMaxY = -Infinity, tMinZ = Infinity, tMaxZ = -Infinity;

                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i);
                        const y = pos.getY(i);
                        const z = pos.getZ(i);

                        if (Math.abs(z) <= fuseHalfWidth) {
                            if (x < fMinX) fMinX = x; if (x > fMaxX) fMaxX = x;
                            if (y < fMinY) fMinY = y; if (y > fMaxY) fMaxY = y;
                            if (z < fMinZ) fMinZ = z; if (z > fMaxZ) fMaxZ = z;
                        } else if (x > splitX) {
                            if (x < wMinX) wMinX = x; if (x > wMaxX) wMaxX = x;
                            if (y < wMinY) wMinY = y; if (y > wMaxY) wMaxY = y;
                            if (z < wMinZ) wMinZ = z; if (z > wMaxZ) wMaxZ = z;
                        } else {
                            if (x < tMinX) tMinX = x; if (x > tMaxX) tMaxX = x;
                            if (y < tMinY) tMinY = y; if (y > tMaxY) tMaxY = y;
                            if (z < tMinZ) tMinZ = z; if (z > tMaxZ) tMaxZ = z;
                        }
                    }

                    this.fuseLocalCenter.set((fMinX + fMaxX) / 2, (fMinY + fMaxY) / 2, (fMinZ + fMaxZ) / 2);
                    this.fuseLocalHalfSize.set((fMaxX - fMinX) / 2, (fMaxY - fMinY) / 2, (fMaxZ - fMinZ) / 2);

                    this.wingLocalCenter.set((wMinX + wMaxX) / 2, (wMinY + wMaxY) / 2, (wMinZ + wMaxZ) / 2);
                    this.wingLocalHalfSize.set((wMaxX - wMinX) / 2, (wMaxY - wMinY) / 2, (wMaxZ - wMinZ) / 2);

                    this.stabLocalCenter.set((tMinX + tMaxX) / 2, (tMinY + tMaxY) / 2, (tMinZ + tMaxZ) / 2);
                    this.stabLocalHalfSize.set((tMaxX - tMinX) / 2, (tMaxY - tMinY) / 2, (tMaxZ - tMinZ) / 2);
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

        if (this.mesh) {
            this.mesh.updateMatrixWorld(true);
        } else {
            c130Mesh.updateMatrixWorld(true);
        }

        // Update Fuselage OBB
        this.fuseOBB.halfSize.copy(this.fuseLocalHalfSize);
        this.fuseOBB.rotation.identity();
        this.fuseOBB.applyMatrix4(c130Mesh.matrixWorld);
        this.fuseOBB.halfSize.set(Math.abs(this.fuseOBB.halfSize.x), Math.abs(this.fuseOBB.halfSize.y), Math.abs(this.fuseOBB.halfSize.z));
        this.fuseOBB.center.copy(this.fuseLocalCenter).applyMatrix4(c130Mesh.matrixWorld);

        // Update Wings OBB
        this.wingOBB.halfSize.copy(this.wingLocalHalfSize);
        this.wingOBB.rotation.identity();
        this.wingOBB.applyMatrix4(c130Mesh.matrixWorld);
        this.wingOBB.halfSize.set(Math.abs(this.wingOBB.halfSize.x), Math.abs(this.wingOBB.halfSize.y), Math.abs(this.wingOBB.halfSize.z));
        this.wingOBB.center.copy(this.wingLocalCenter).applyMatrix4(c130Mesh.matrixWorld);

        // Update Horizontal Stabilizer OBB
        this.stabOBB.halfSize.copy(this.stabLocalHalfSize);
        this.stabOBB.rotation.identity();
        this.stabOBB.applyMatrix4(c130Mesh.matrixWorld);
        this.stabOBB.halfSize.set(Math.abs(this.stabOBB.halfSize.x), Math.abs(this.stabOBB.halfSize.y), Math.abs(this.stabOBB.halfSize.z));
        this.stabOBB.center.copy(this.stabLocalCenter).applyMatrix4(c130Mesh.matrixWorld);

        // Update overall bounding OBB
        this.obb.halfSize.copy(this.overallLocalHalfSize);
        this.obb.rotation.identity();
        this.obb.applyMatrix4(c130Mesh.matrixWorld);
        this.obb.halfSize.set(Math.abs(this.obb.halfSize.x), Math.abs(this.obb.halfSize.y), Math.abs(this.obb.halfSize.z));
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
            if (this.trackLine.length > 0) {
                this.trackLine = [];
                this.tlGeometry.setFromPoints(this.trackLine);
            }
            this.tlMesh.visible = false;
        }
    }

    intersectRayExpandedOBB(ray, obb, expansion, hitPoint) {
        obb.clampPoint(ray.origin, this._clampTestPt);
        if (ray.origin.distanceTo(this._clampTestPt) <= expansion) {
            if (hitPoint) hitPoint.copy(ray.origin);
            return true;
        }

        obb.getSize(this._obbSize);
        this._obbSize.x += expansion * 2;
        this._obbSize.y += expansion * 2;
        this._obbSize.z += expansion * 2;

        this._expandedAABB.setFromCenterAndSize(this._zeroVec, this._obbSize);

        this._obbMatrix.setFromMatrix3(obb.rotation);
        this._obbMatrix.setPosition(obb.center);

        this._invOBBMatrix.copy(this._obbMatrix).invert();
        this._localRay.copy(ray).applyMatrix4(this._invOBBMatrix);

        if (this._localRay.intersectBox(this._expandedAABB, this._localHitPt)) {
            if (hitPoint) hitPoint.copy(this._localHitPt).applyMatrix4(this._obbMatrix);
            return true;
        }

        return false;
    }

    checkCollision(missileBox, prevPt, currPt, proxFuse) {
        if (this.hit || !this.aircraftMesh) return false;

        // 1. Discrete Box3 check against all 3 OBBs
        if (this.fuseOBB.intersectsBox3(missileBox) ||
            this.wingOBB.intersectsBox3(missileBox) ||
            this.stabOBB.intersectsBox3(missileBox)) {
            return true;
        }

        // 2. Point proximity check for current point
        if (currPt) {
            this.fuseOBB.clampPoint(currPt, this._clampedPt);
            if (currPt.distanceTo(this._clampedPt) <= proxFuse) return true;

            this.wingOBB.clampPoint(currPt, this._clampedPt);
            if (currPt.distanceTo(this._clampedPt) <= proxFuse) return true;

            this.stabOBB.clampPoint(currPt, this._clampedPt);
            if (currPt.distanceTo(this._clampedPt) <= proxFuse) return true;
        }

        // 3. Swept continuous collision check (eliminates tunneling at 686 m/s)
        if (prevPt && currPt) {
            this._segVec.subVectors(currPt, prevPt);
            const segLen = this._segVec.length();
            if (segLen > 0.001) {
                this._rayDir.copy(this._segVec).normalize();
                this._ray.set(prevPt, this._rayDir);

                if (this.intersectRayExpandedOBB(this._ray, this.fuseOBB, proxFuse, this._hitPt)) {
                    if (prevPt.distanceTo(this._hitPt) <= segLen + proxFuse) return true;
                }
                if (this.intersectRayExpandedOBB(this._ray, this.wingOBB, proxFuse, this._hitPt)) {
                    if (prevPt.distanceTo(this._hitPt) <= segLen + proxFuse) return true;
                }
                if (this.intersectRayExpandedOBB(this._ray, this.stabOBB, proxFuse, this._hitPt)) {
                    if (prevPt.distanceTo(this._hitPt) <= segLen + proxFuse) return true;
                }
            }
        }

        return false;
    }

    hitcam(camera, controls) {
        if (!this.aircraftMesh) return;
        const c130Mesh = this.aircraftMesh;
        c130Mesh.getWorldPosition(this.pt);
        camera.position.set(this.pt.x, this.pt.y + 50, this.pt.z);
        if (controls && controls.target) {
            controls.target.set(this.pt.x, this.pt.y + 20, this.pt.z);
        }
    }

    reset() {
        this.hit = false;
        this.t = 0;
        this.trackLine = [];
        this.tlGeometry.setFromPoints(this.trackLine);
        this.tlMesh.visible = false;
    }
}