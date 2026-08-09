import * as THREE from "../modules/three.module.js";

export class Environment {
    constructor(scene, isMobile) {
        this.scene = scene;
        this.isMobile = isMobile;
        this.properplane = null;
        this.wireplane = null;
        this.initSkybox();
        this.generatePlane();
    }

    initSkybox() {
        const sbLoad = new THREE.CubeTextureLoader();
        const sbBg = this.isMobile ? "./assets/skybox/bg.min.png" : "./assets/skybox/bg.png";
        const sbTop = this.isMobile ? "./assets/skybox/top.min.png" : "./assets/skybox/top.png";
        const sbTexture = sbLoad.load([sbBg, sbBg, sbTop, sbTop, sbBg, sbBg]);
        this.scene.background = sbTexture;
    }

    generatePlane() {
        if (this.properplane) this.scene.remove(this.properplane);
        if (this.wireplane) this.scene.remove(this.wireplane);

        const planesize = 100;
        const wireplaneMesh = new THREE.PlaneGeometry(10000, 10000, planesize, planesize);
        const wireplaneMaterial = new THREE.MeshBasicMaterial({
            color: 0x008800,
            side: THREE.DoubleSide,
            wireframe: true,
        });
        this.wireplane = new THREE.Mesh(wireplaneMesh, wireplaneMaterial);
        this.wireplane.rotation.set(Math.PI / 2, 0, 0);
        this.wireplane.position.set(0, 0.1, 0);
        this.scene.add(this.wireplane);

        const wireplaneMeshArray = this.wireplane.geometry.attributes.position.array;
        let prev = 0;
        for (let i = 0; i < wireplaneMeshArray.length; i += 3) {
            const z = wireplaneMeshArray[i + 2];
            const weight = Math.random() * 15;
            const posneg = Math.random();
            const rdm = posneg > 0.2 ? weight : -weight;
            wireplaneMeshArray[i + 2] = z + prev + rdm;
            prev = rdm;
        }

        const midnode = (((planesize + 1) * (planesize / 2)) + (planesize / 2)) * 3;
        const properplaneMesh = wireplaneMesh.clone();
        const properplaneMaterial = new THREE.MeshBasicMaterial({
            color: 0x74B06A,
            side: THREE.DoubleSide,
        });
        this.properplane = new THREE.Mesh(properplaneMesh, properplaneMaterial);
        this.properplane.rotation.set(Math.PI / 2, 0, 0);

        this.wireplane.position.y += wireplaneMeshArray[midnode + 2];
        this.properplane.position.y += wireplaneMeshArray[midnode + 2];

        this.scene.add(this.properplane);
    }
}