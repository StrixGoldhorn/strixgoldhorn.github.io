import * as THREE from './three.module.js';

class DetectedSignal {
    constructor(freq) {
        this.freq = freq;
        this.strengthPosHistory = [];
        this.currPosMax = Number.NEGATIVE_INFINITY;
        this.prevPosMax = Number.NEGATIVE_INFINITY;
        this.currPosHistoryNEW = false;

        this.estPRFprev = -2;
        this.estPRF = -1;
        this.estPRFstable = false;
        this.estPeak = Number.NEGATIVE_INFINITY;
        this.estPeakPrevTime = -1;

        this.markedAtCurrLoc = false;

    }

    // Function to calculate the intersection circle of two spheres
    calculateSphereSphere(sphere1, sphere2) {
        const { x: x1, y: y1, z: z1, radius: r1 } = sphere1;
        const { x: x2, y: y2, z: z2, radius: r2 } = sphere2;

        const d = Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2) +
            Math.pow(z2 - z1, 2)
        );

        if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
            return null; // No intersection
        }

        const h = 0.5 + (r1 * r1 - r2 * r2) / (2 * d * d);

        const cx = x1 + h * (x2 - x1);
        const cy = y1 + h * (y2 - y1);
        const cz = z1 + h * (z2 - z1);

        const rCircle = Math.sqrt(r1 * r1 - h * h * d * d);

        const nx = (x2 - x1) / d;
        const ny = (y2 - y1) / d;
        const nz = (z2 - z1) / d;

        return {
            center: { x: cx, y: cy, z: cz },
            radius: rCircle,
            normal: { x: nx, y: ny, z: nz }
        };
    }

    calculateCircleSphere(circle, sphere) {
        const cCircle = new THREE.Vector3(circle.center.x, circle.center.y, circle.center.z);
        const rCircle = circle.radius;     
        const nCircle = new THREE.Vector3(circle.normal.x, circle.normal.y, circle.normal.z);

        const cSphere = new THREE.Vector3(sphere.x, sphere.y, sphere.z);
        const rSphere = sphere.radius;

        let d = nCircle.clone();
        let tempD = cCircle.clone()
        tempD.sub(cSphere);
        d = d.dot(tempD);

        if(Math.abs(d) > rSphere){ return null;}

        let cPlane = cSphere.clone();
        cPlane.add(nCircle.clone().multiplyScalar(d));

        let rPlane = Math.sqrt(rSphere*rSphere - d*d);

        return this.find2CircleIntersection(cCircle, rCircle, cPlane, rPlane, nCircle);
    }


    find2CircleIntersection(c1, r1, c2, r2, n){
        const d = c1.distanceTo(c2);

        if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
            return null; // No intersection
        }

        const h = 0.5 + (r1 * r1 - r2 * r2) / (2 * d * d);

        let ci = c2.clone()
        ci.sub(c1);
        ci.multiplyScalar(h)
        ci.add(c1)

        const ri = Math.sqrt(Math.abs(r1 * r1 - h * h * d * d));

        let t = c2.clone();
        t.sub(c1);
        t.cross(n);
        t.normalize();

        let p0t = t.clone();
        t.multiplyScalar(ri);
        let p0 = ci.clone()
        p0.sub(p0t);

        let p1t = t.clone();
        t.multiplyScalar(ri);
        let p1 = ci.clone()
        p1.add(p1t);
        
        return [p0, p1];
    }

    chooseClosestPtToSphere(twoPts, s4){
        if(twoPts){
            let d1 = (new THREE.Vector3(s4.x, s4.y, s4.z)).distanceTo(twoPts[0]);
            let d2 = (new THREE.Vector3(s4.x, s4.y, s4.z)).distanceTo(twoPts[1]);
            if( d1 < d2 ){ return twoPts[0] }
            else{ return twoPts[1] }
        }
    }

    takeFourInputs(s1, s2, s3, s4){
        let circle = this.calculateSphereSphere(s1, s2);
        let twoPts = this.calculateCircleSphere(circle, s3);
        let finalPt = this.chooseClosestPtToSphere(twoPts, s4);
        return finalPt;
    }

    getAllPossiblePts(){
        let allPts = [];
        for (let i = 0; i < this.strengthPosHistory.length - 3; i++) {
            const pt = this.takeFourInputs(this.strengthPosHistory[i], this.strengthPosHistory[i+1], this.strengthPosHistory[i+2], this.strengthPosHistory[i+3]);
            if(pt.x != NaN){ allPts.push(pt); }
        }

        for (let i = 0; i < this.strengthPosHistory.length; i++) {
            for (let j = i + 1; j < this.strengthPosHistory.length; j++) {
                for (let k = j + 1; k < this.strengthPosHistory.length; k++) {
                    for (let m = k + 1; m < this.strengthPosHistory.length; m++) {
                        this.takeFourInputs(this.strengthPosHistory[i], this.strengthPosHistory[j], this.strengthPosHistory[k], this.strengthPosHistory[m]);
                    }
                }
            }
        }

        return allPts;
    }

    averagePoints(points) {
        const total = points.reduce(
            (sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y, z: sum.z + p.z }),
            { x: 0, y: 0, z: 0 }
        );

        return {
            x: total.x / points.length,
            y: total.y / points.length,
            z: total.z / points.length
        };
    }

}

export { DetectedSignal };