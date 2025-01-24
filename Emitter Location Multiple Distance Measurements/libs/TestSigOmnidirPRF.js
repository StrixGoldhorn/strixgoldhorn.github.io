import * as THREE from './three.module.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

class TestSigOmnidirPRF {
    constructor(freq, position) {
        this.id = crypto.randomUUID().slice(0, 4);

        // Antenna params (in dB)
        this.txERP = 75;
        this.maxtxERP = 75;
        this.frequency = freq; // in MHz

        this.modulation = "pulsed";

        this.pulseRepInterval = 1/0.5;
        this.prevtime = 0;
        this.timeOffset = Math.random()/5;

        this.loadFontAndCreateLabel();

        this.geometry = new THREE.SphereGeometry(8, 16, 16);
        this.material = new THREE.MeshBasicMaterial({ color: 0xa97c43 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(...position);
    }

    updateSignal(time) {
        this.txERP = (this.maxtxERP / 2) * Math.sin((time + this.timeOffset) * this.pulseRepInterval * Math.PI * 2) + this.maxtxERP / 2;
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

export { TestSigOmnidirPRF };
