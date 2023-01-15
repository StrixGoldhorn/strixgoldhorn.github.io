import * as THREE from './three.module.js';
import { Target } from './target.js';

export class SAM {
    constructor(x, y, z, uuid) {
        this.uuid = uuid;
        this.displacement = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.log = [];
        this.maxspeed = 5.1;
        this.maxaccel = 5;
        this.maxforce = 5;

        this.decayVelo = 0;

        this.hdglen = 60;
        this.wpnRange = 10;
        this.detectionRange = 1500;
        this.firingRange = 700;
        this.fired = false;
        this.target = null;
        this.targetpos = new THREE.Vector3(0, 0, 0)

        this.time = 0;

        this.collided = false;

        this.zeroVec = new THREE.Vector3(0, 0, 0);
        this.steerVec = new THREE.Vector3(0, 0, 0);
        this.diffVec = new THREE.Vector3(0, 0, 0);
    }

    steer(target) {
        this.steerVec.copy(this.zeroVec);
        this.diffVec.subVectors(this.displacement, target);
        this.diffVec.normalize();
        this.steerVec.sub(this.diffVec);
        this.steerVec.normalize();
        this.steerVec.multiplyScalar(this.maxspeed);
        this.steerVec.sub(this.velocity);
        this.steerVec.clampLength(0, this.maxforce);
        this.acceleration.add(this.steerVec);
        this.acceleration.clampLength(0, this.maxaccel);
    }

    radarGuide(queried) {
        let d = this.displacement.distanceTo(queried.displacement);

        if (
            (d > 0) && // check if self
            ((this.target == null) || (this.target.uuid == queried.uuid)) // track only if no target or if target is already tracked
        ) {
            if (this.target == null && (d < this.detectionRange)) {
                this.target = new Target(queried.uuid);
            }

            if (this.target != null) {
                if (this.target.displacementLog.length > 29) {
                    this.target.displacementLog.shift();
                }

                this.target.displacementLog.push(new THREE.Vector3().copy(queried.displacement));

                let predictedVector = this.target.extrapolatePath(this.displacement, this.velocity.length());
                this.targetpos.copy(predictedVector);


                if (d < this.detectionRange && !this.collided && this.fired) {// check if within detection range
                    this.steer(predictedVector);
                    console.log("In range of SAM", this.uuid)
                    this.time += 1;
                }
                else if (d < this.firingRange && !this.collided && !this.fired) {
                    this.steer(predictedVector);
                    console.log("SAM", this.uuid, "has fired")
                    this.time += 1;
                    this.fired = true;
                }
            }

        }

        if (d <= this.wpnRange && this.constructor.name != queried.constructor.name) {
            this.target = null;
            this.targetPath = [];
            this.collided = true;
            return true
        }

        if (this.maxspeed - this.decayVelo == 0) {
            this.target = null;
            this.targetPath = [];
            this.collided = true;
        }
        return false
    }

    update() {
        this.acceleration.clampLength(0, this.maxaccel);
        if (this.time > 500) {
            // noob way to implement simple decay for speed of SAM
            this.decayVelo += 0.05;
        }
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxspeed - this.decayVelo);

        this.displacement.add(this.velocity);
    }
}