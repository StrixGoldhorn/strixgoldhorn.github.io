import * as THREE from './three.module.js';
import { ImprovedNoise } from './ImprovedNoise.js';

class Terrain {
    constructor(edgeLength, edgeCount, perlinMult, heightMult) {
        this.edgeLength = edgeLength;
        this.edgeCount = edgeCount;
        
        this.perlinMult = perlinMult;
        this.heightMult = heightMult;

        this.geometry = new THREE.PlaneGeometry(this.edgeLength, this.edgeLength, this.edgeCount, this.edgeCount);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x88cc88,
            side: THREE.DoubleSide,  // Double-sided material to view from both sides
            flatShading: true
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Rotate the terrain to lay flat (parallel to ground)
        this.mesh.rotation.x = -Math.PI / 2;
        
        this.applyPerlinNoise();
    }

    applyPerlinNoise() {
        const perlin = new ImprovedNoise();
        for (let i = 0; i < this.geometry.attributes.position.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(this.geometry.attributes.position, i);
            vertex.z = perlin.noise(vertex.x * this.perlinMult, vertex.y * this.perlinMult, 0) * this.heightMult;

            this.geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        this.geometry.computeVertexNormals();
    }

    getTerrainHeight(x, z) {
        const perlin = new ImprovedNoise();
        return perlin.noise(x * this.perlinMult, -z * this.perlinMult, 0) * this.heightMult;
    }
}

export { Terrain };
