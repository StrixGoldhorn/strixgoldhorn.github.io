import * as THREE from './three.module.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

class Signal {
    constructor(color, position) {
        this.id = crypto.randomUUID().slice(0, 4);

        // Antenna params (in dB)
        // this.txERP = 90;

        this.geometry = new THREE.SphereGeometry(8, 16, 16);
        this.material = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(...position);
    }

    updateSignal(time) {
        // Animate the signal to visualize frequency transmission
        // const scaleFactor = 1 + Math.sin(time * this.frequency) * 0.5;
        // this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
}



class ThreatXMTR extends Signal{
    constructor(color, frequency, modulation, position) {
        super(color, position);

        // Antenna params (in dB)
        this.txERP = 85;
        this.frequency = frequency; // in MHz
        this.modulation = modulation;

        this.loadFontAndCreateLabel();

        console.log("THREAT", this.id, this.frequency)
    }

    loadFontAndCreateLabel() {
        const loader = new FontLoader();

        loader.load('libs/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new TextGeometry(this.id, {
                font: font,
                size: 15,  // Size of the text
                height: 0.2,  // Thickness of the text
                curveSegments: 12,
            });

            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });  // Green text color
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Position the text next to the signal
            this.textMesh.position.set(0, 15, 10);
            this.textMesh.lookAt(0, 50, 0);  // Make the text face the origin or camera

            // Add the text label as a child of the signal mesh (so it moves with the signal)
            this.mesh.add(this.textMesh);
        });
    }

    updateSignalLabel(pos){
        this.textMesh.lookAt(pos[0], pos[1], pos[2]);
    }
}



class BGXMTR extends Signal{
    constructor(frequencyArr, modulation, position) {
        super(0xffff00, position);

        // CHANGE TO TOGGLE VISIBILITY 
        // this.material.visible = false;

        // Antenna params (in dB)
        this.txERP = 80;
        this.frequency = frequencyArr[Math.floor(Math.random() * frequencyArr.length)]; // Randomly choose from freq list
        this.modulation = modulation;
    }
}




export { Signal, ThreatXMTR, BGXMTR };
