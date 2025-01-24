import * as THREE from './three.module.js';
import { DetectedSignal } from './DetectedSignal.js';

class Player {
    constructor(position) {
        this.geometry = new THREE.BoxGeometry(10, 10, 10);
        this.material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(...position);

        this.prevpos = this.mesh.position.clone();
        this.atSamePosFor = 0;

        // Antenna params (in dB)
        this.recvAntennaSensitivity = -45;
        this.recvAntennaGain = 2;

        // Movement parameters
        // this.movementSpeed = 500;
        this.movementSpeed = 1000;
        this.direction = new THREE.Vector3();  // Direction vector for movement

        this.dbKnownThreats = [
            {name: "Test1500", freq: 1500, pri: 0.2, erp: 75},
            {name: "Test5500", freq: 5500, pri: 0.4, erp: 75}
        ]

        this.needUpdateTable = false;

        this.dbDetectedSignals = []

        this.freqSigStrArr, this.bandwidthStart;


        // Display
        this.container = document.createElement('span');
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.left = '10px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.padding = '5px';
        this.container.style.color = 'white';
        document.body.appendChild(this.container);

        this.posDisp = document.createElement('p');
        this.container.appendChild(this.posDisp);

        this.timeDisp = document.createElement('p');
        this.container.appendChild(this.timeDisp);

        this.peakTable = document.createElement('table');
        this.container.appendChild(this.peakTable);
        this.createTable();
    }

    processor(freqSigStrArr, bandwidthStart, time) {
        // update freqSigStrArr
        this.freqSigStrArr = freqSigStrArr;
        this.bandwidthStart = bandwidthStart;

        function getStandardDeviation(array) {
            const n = array.length
            const mean = array.reduce((a, b) => a + b) / n
            return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
        };

        function getAverage(array) {
            let sum = 0;
            for (let i = 0; i < array.length; i++) {
                sum += array[i];
            }
            return sum / array.length;
        }


        // check if player has moved
        if (!this.mesh.position.equals(this.prevpos)) {
            this.prevpos = this.mesh.position.clone();
            this.dbDetectedSignals.forEach(DS => {
                DS.currPosMax = Number.NEGATIVE_INFINITY;
                DS.currPosHistoryNEW = false;
                DS.estPRFstable = false;
                DS.markedAtCurrPos = false;
            });

            this.atSamePosFor = 0;
        }
        else {
            this.atSamePosFor += 1;
        }

        const outlierLimit = getAverage(freqSigStrArr) + 3 * getStandardDeviation(freqSigStrArr);
        freqSigStrArr.forEach((strength, index) => {
            if (strength > outlierLimit) {
                let outlierFreq = bandwidthStart + index;

                // if not added yet
                if (!this.dbDetectedSignals.find(x => x.freq == outlierFreq)) {
                    let newDS = new DetectedSignal(outlierFreq)
                    this.dbDetectedSignals.push(newDS);
                    this.needUpdateTable = true;
                }

                else {
                    let DS = this.dbDetectedSignals[this.dbDetectedSignals.findIndex(x => x.freq == outlierFreq)];

                    // if curr strength greater than existing
                    if (DS.currPosMax < strength) {
                        DS.currPosMax = strength;

                        if (DS.estPeak < strength) {
                            DS.estPeak = strength;
                        }
                        this.needUpdateTable = true;
                    }

                    // check if currPosMax within around 10% of estPeak
                    if (strength + 0.0001 >= DS.currPosMax) {
                        // console.log("str, DScurrPosMax", strength, DS.currPosMax)
                        // check if at same position for a good amount of time, and that max strength is not continuously increasing
                        if (DS.estPeakPrevTime != -1 && this.atSamePosFor > 2 && strength.toFixed(8) + 0.01 > DS.prevPosMax.toFixed(8)) {

                            let estPRF = time - DS.estPeakPrevTime;
                            // console.log("estPRF, DSestPRF", estPRF, DS.estPRFprev)

                            // if same as prev estimation
                            if (estPRF.toFixed(4) == DS.estPRFprev.toFixed(4)) {
                                // console.log("EstPRF!", strength.toFixed(8), estPRF.toFixed(4));
                                DS.estPRF = estPRF;
                                DS.estPRFstable = true;

                                // if (!DS.markedAtCurrPos) {
                                //     this.addCircle(outlierFreq);
                                //     this.markPos(outlierFreq);
                                //     DS.strengthPosHistory.push({ x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z, radius: this.calculateDistance(DS.currPosMax, this.recvAntennaGain, outlierFreq, 75) })

                                //     let allPts = DS.getAllPossiblePts();

                                //     const sphereGeometry = new THREE.SphereGeometry(10, 8, 8);
                                //     const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
                                //     const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                                //     sphereMesh.rotation.x = Math.PI / 2;
                                //     sphereMesh.position.copy(allPts[allPts.length - 1]);
                                //     this.mesh.parent.add(sphereMesh);

                                //     // allPts.forEach(pt => {
                                //     //     if (pt) {
                                //     //         const sphereGeometry = new THREE.SphereGeometry(30, 8, 8);
                                //     //         const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
                                //     //         const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                                //     //         sphereMesh.rotation.x = Math.PI / 2;
                                //     //         sphereMesh.position.copy(pt);
                                //     //         this.mesh.parent.add(sphereMesh);
                                //     //     }
                                //     // })

                                // }

                                DS.markedAtCurrPos = true;
                            }

                            DS.estPRFprev = estPRF;
                        }

                        DS.estPeakPrevTime = time;
                    }
                    DS.prevPosMax = DS.currPosMax;
                }





            }
        })


    }

    movePlayer(deltaTime) {
        // Update player position based on direction and movement speed
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.movementSpeed * deltaTime));
    }

    getPosition() {
        return this.mesh.position;
    }

    setDirection(forward, right, up) {
        // Set the direction based on input (forward/backward and left/right)
        this.direction.set(right, up, forward).normalize();
    }

    createTable(time) {
        if (this.needUpdateTable) {
            this.peakTable.innerHTML = "";
            let tr1, th1, th2, th3;
            tr1 = document.createElement('tr');
            th1 = document.createElement('th');
            th2 = document.createElement('th');
            th3 = document.createElement('th');
            this.peakTable.appendChild(tr1);
            tr1.appendChild(th1);
            tr1.appendChild(th2);
            tr1.appendChild(th3);
            th1.innerText = "Freq (Hz)";
            th2.innerText = "Peak (dBm)";


            this.dbDetectedSignals.forEach(elem => {
                let tr, td1, td2, td3, btn;
                tr = document.createElement('tr');
                td1 = document.createElement('td');
                td2 = document.createElement('td');
                td3 = document.createElement('td');
                this.peakTable.appendChild(tr);
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                td1.innerText = elem.freq.toFixed(2);
                td2.innerText = elem.estPeak.toFixed(2);

                btn = document.createElement('button');
                btn.id = "mark" + elem.freq.toString();
                btn.innerText = "Mark";
                btn.addEventListener('click', () => {
                    this.markClicked(Number(btn.id.slice(4)))
                });
                td3.appendChild(btn);
            });



            this.needUpdateTable = false;
        }

    }

    markClicked(freq) {
        if (this.dbDetectedSignals[this.dbDetectedSignals.findIndex(x => x.freq == freq)].estPRFstable == true) {
            this.addCircle(freq);
            this.markPos(freq);
            this.dbDetectedSignals[this.dbDetectedSignals.findIndex(x => x.freq == freq)].strengthPosHistory.push({ x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z, radius: this.calculateDistance(this.dbDetectedSignals[this.dbDetectedSignals.findIndex(x => x.freq == freq)].currPosMax, this.recvAntennaGain, freq, 75) })
            try {
                let allPts = this.dbDetectedSignals[this.dbDetectedSignals.findIndex(x => x.freq == freq)].getAllPossiblePts();
                allPts.forEach(pt => {
                    if (pt) {
                        const sphereGeometry = new THREE.SphereGeometry(30, 8, 8);
                        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
                        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                        sphereMesh.rotation.x = Math.PI / 2;
                        sphereMesh.position.copy(pt);
                        // sphereMesh.name = "MARKING";
                        this.mesh.parent.add(sphereMesh);
                    }
                });

            } catch (error) {
                console.log("-----ERROR-----", error)
            }
        }
    }

    updateDisp(time) {
        this.posDisp.innerText = "Pos: " + this.mesh.position.x.toFixed(0) + " " + this.mesh.position.y.toFixed(0) + " " + this.mesh.position.z.toFixed(0);
        this.timeDisp.innerText = "Time: " + time.toFixed(2);
        this.createTable(time);
    }

    calculateDistance(freqStrength, recvAntennaGain, signalFrequency, signalTxERP) {
        const term1 = signalTxERP + recvAntennaGain - freqStrength - 32;
        const term2 = 20 * Math.log10(signalFrequency);
        const exponent = (term1 - term2) / 20;

        const distance = Math.pow(10, exponent);
        return distance;
    }

    addCircle(freq) {
        let freqStrength = this.dbDetectedSignals[this.dbDetectedSignals.findIndex(x => x.freq == freq)].currPosMax;
        let radius = this.calculateDistance(freqStrength, this.recvAntennaGain, freq, 75)
        console.log("working", radius)
        const circleGeometry = new THREE.RingGeometry(radius - 3, radius + 3, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        circleMesh.rotation.x = Math.PI / 2;
        circleMesh.position.copy(this.mesh.position.clone())
        circleMesh.name = "MARKING";
        this.mesh.parent.add( circleMesh );

        const sphereGeometry = new THREE.SphereGeometry(radius, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.rotation.x = Math.PI / 2;
        sphereMesh.position.copy(this.mesh.position.clone())
        sphereMesh.name = "MARKING";
        this.mesh.parent.add( sphereMesh );

        const wireframe = new THREE.WireframeGeometry(sphereGeometry);
        const line = new THREE.LineSegments(wireframe);
        line.rotation.x = Math.PI / 2;
        line.position.copy(this.mesh.position.clone())
        line.material.depthTest = false;
        line.material.opacity = 0.5;
        line.material.transparent = true;
        line.name = "MARKING";
        this.mesh.parent.add( line );
    }

    markPos() {

    }
}

export { Player };