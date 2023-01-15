import * as THREE from './three.module.js';

export class Target {
    constructor(uuid) {
        this.uuid = uuid;
        this.displacementLog = [];
    }

    extrapolatePath(chasePos, chaseSpeed) {
        let predicted;

        if (this.displacementLog.length >= 2) {
            // curr refers to TARGET being tracked
            // chase refers to the PURSUER

            let curr = this.displacementLog[this.displacementLog.length - 1];
            let prev = this.displacementLog[this.displacementLog.length - 2];

            let d = chasePos.distanceTo(curr);

            let Va = new THREE.Vector3();
            Va.subVectors(curr, prev);

            let Sa = Va.length();
            let Sb = chaseSpeed;
            let D = new THREE.Vector3();
            D.subVectors(chasePos, curr);

            // at^2 + bt + c = 0
            let a = Sb - Sa;
            let b = 2 * D.dot(Va);
            let c = - (d ** 2);

            // check discriminant to see if there are real solutions to the equation
            // if discriminant > 0, there is/are real solution(s), hence it is possible to intercept the target
            // if discriminant < 0, there are no real solutions, hence it is not possible to intercept the target, at least using constant bearing
            let discriminant = b ** 2 - 4 * a * c;

            // if there is/are real solution(s), use constant bearing
            if (discriminant > 0) {
                let t1 = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
                let t2 = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);

                let VaNormalised = new THREE.Vector3().copy(Va).normalize();

                let I1 = new THREE.Vector3()
                let aa = new THREE.Vector3().copy(VaNormalised)
                aa.setLength(Math.abs(t1 * Sa));
                I1.addVectors(curr, aa);

                let I2 = new THREE.Vector3()
                let ab = new THREE.Vector3().copy(VaNormalised)
                ab.setLength(Math.abs(t2 * Sa));
                I2.addVectors(curr, ab);

                if (curr.distanceTo(I1) > curr.distanceTo(I2)) {
                    return I2;
                }
                else {
                    return I1;
                }
            }

            // else no real solution, default to pure pursuit
            else {
                return this.displacementLog[this.displacementLog.length - 1]
            }


        }

        else {
            predicted = this.displacementLog[this.displacementLog.length - 1]
            return predicted;
        }
    }


}