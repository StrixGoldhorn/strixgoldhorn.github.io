import { OrbitControls } from './OrbitControls.js';
import * as THREE from './three.module.js';
import { createNoise2D } from './simplex-noise.js';

class Airplane {
    constructor() {
        this.displacement = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.prevvelo = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.nosedir = new THREE.Vector3(0, 0, 0);
        this.maxspeed = 3.43;
        this.maxaccel = 0.14;
        this.currspeed = 0;
        this.curraccel = 0;
        this.mass = 20410000;
    }

    updateAccel(currThrottle) {
        this.acceleration.copy(this.nosedir);
        this.acceleration.setLength((currThrottle - 100) * (this.maxaccel / 100));
        this.acceleration.clampLength(0, this.maxaccel);
        this.curraccel = (currThrottle - 100) * (this.maxaccel / 200);
        this.updateVelo();
    }

    updateVelo() {
        this.velocity.copy(this.nosedir);
        this.currspeed += this.curraccel;
        if (this.currspeed > this.maxspeed) {
            this.currspeed = this.maxspeed;
        }
        else if (this.currspeed < 0) {
            this.currspeed = 0;
        }
        this.velocity.setLength(this.currspeed)
        this.velocity.clampLength(0, this.maxspeed);
    }

}

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x588bc4);

var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 25000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById("canvas").appendChild(renderer.domElement);

var controls;

function setControls() {
    camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enablePan = false;
}
setControls();



let properGround, wireGround, planesize, planewh;
var planeHeightCoords = [], wireGroundMeshArray;

function generateGround() {
    planesize = 200
    planewh = 10000
    const wireGroundMesh = new THREE.PlaneGeometry(planewh, planewh, planesize, planesize);
    const wireGroundMaterial = new THREE.MeshBasicMaterial({
        color: 0x008800,
        side: THREE.DoubleSide,
        wireframe: true,
    });
    wireGround = new THREE.Mesh(wireGroundMesh, wireGroundMaterial);
    wireGround.rotation.set(Math.PI / 2, 0, 0);
    wireGround.position.set(0, 0.1, 0);
    scene.add(wireGround);

    wireGroundMeshArray = wireGround.geometry.attributes.position.array;
    const plane2dNoise = createNoise2D();

    for (let i = 0; i < wireGroundMeshArray.length; i += 3) {
        let x = wireGroundMeshArray[i];
        let y = wireGroundMeshArray[i + 1];
        let z = wireGroundMeshArray[i + 2];

        wireGroundMeshArray[i + 2] = z + plane2dNoise(x / 2000, y / 2000) * 300;
        planeHeightCoords[[x, y]] = -wireGroundMeshArray[i + 2];
    }

    const properGroundMesh = wireGroundMesh.clone();
    const properGroundMaterial = new THREE.MeshStandardMaterial({
        color: 0x74B06A,
        side: THREE.DoubleSide,
        roughness: 0.5
    });
    properGround = new THREE.Mesh(properGroundMesh, properGroundMaterial);
    properGround.rotation.set(Math.PI / 2, 0, 0);
    properGround.castShadow = true;
    properGround.receiveShadow = true;
    scene.add(properGround);
}

generateGround();



// lights
function generateLights() {
    const directionalLight = new THREE.DirectionalLight(0x404040, 2);
    scene.add(directionalLight);

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);
}

generateLights();



const aircraftBodyGeom = new THREE.CylinderGeometry(1, 1, 20, 8);
const aircraftWingGeom = new THREE.BoxGeometry(15, 1, 5);
const aircraftNoseGeom = new THREE.ConeGeometry(2, 2, 8);
const aircraftTailGeom = new THREE.BoxGeometry(1, 4, 3);

const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const aircraftBodyObj = new THREE.Mesh(aircraftBodyGeom, material);
const aircraft = new THREE.Mesh(aircraftWingGeom, material);
const aircraftWingObj = new THREE.Mesh(aircraftWingGeom, material);
const aircraftNoseObj = new THREE.Mesh(aircraftNoseGeom, material);
const aircraftTailObj = new THREE.Mesh(aircraftTailGeom, material);

scene.add(aircraft);
aircraft.add(aircraftWingObj);
aircraft.add(aircraftBodyObj);
aircraft.add(aircraftNoseObj);
aircraft.add(aircraftTailObj);
aircraftNoseObj.position.z += 11;
aircraftTailObj.position.z -= 10;
aircraftTailObj.position.y += 1;
aircraftNoseObj.rotateX(Math.PI / 2);
aircraftBodyObj.rotateX(Math.PI / 2);

const aircraftBox3 = new THREE.Box3();
aircraftBox3.setFromObject(aircraft);

camera.position.set(0, 50, -70);
aircraft.position.y = 20;
controls.target = aircraft.position;
controls.update();



var KeyPressed = {};
const setupKP = () => {
    window.addEventListener('keydown', keyDown, false)
    window.addEventListener('keyup', keyUp, false)
}

const keyDown = (e) => {
    KeyPressed[e.code] = true;
}

const keyUp = (e) => {
    delete KeyPressed[e.code];
}

setupKP();

const plane = new Airplane();

const throttleElem = document.getElementById("throttleIndicator");
function checkKP() {
    if ('KeyW' in KeyPressed) {
        aircraft.rotateX(0.01);
    }

    if ('KeyS' in KeyPressed) {
        aircraft.rotateX(-0.01);
    }

    if ('KeyA' in KeyPressed) {
        aircraft.rotateZ(-0.01);
    }

    if ('KeyD' in KeyPressed) {
        aircraft.rotateZ(0.01);
    }

    if ('KeyQ' in KeyPressed) {
        aircraft.rotateY(0.01);
    }

    if ('KeyE' in KeyPressed) {
        aircraft.rotateY(-0.01);
    }


    let currThrottle = parseFloat(throttleElem.getAttribute('Value'))
    if ('PageUp' in KeyPressed && currThrottle < 200) {
        throttleElem.setAttribute('Value', currThrottle + 1);
    }

    if ('PageDown' in KeyPressed && currThrottle > 0) {
        throttleElem.setAttribute('Value', currThrottle - 1);
    }

    if ('Space' in KeyPressed) {
        throttleElem.setAttribute('Value', 100);
    }

    if ('Home' in KeyPressed) {
        throttleElem.setAttribute('Value', 100);
        plane.currspeed = 0;
    }

    if ('KeyR' in KeyPressed && crashed) {
        let tempV = new THREE.Vector3(0, 0, 0);
        aircraft.getWorldPosition(tempV);
        tempV.add(new THREE.Vector3(0, 50, 0));
        aircraft.position.copy(tempV);
        camera.position.add(new THREE.Vector3(0, 50, 0));
        crashed = false;
    }
    plane.updateAccel(currThrottle);
}



let tempV = new THREE.Vector3;
let tempCam = new THREE.Vector3;

var aircraftBodyBB = new THREE.BoundingBoxHelper(aircraftBodyObj, 0xffff00);
var aircraftWingBB = new THREE.BoundingBoxHelper(aircraftWingObj, 0xffff00);
var aircraftTailBB = new THREE.BoundingBoxHelper(aircraftTailObj, 0xffff00);

const geometry = new THREE.BoxGeometry(2, 20, 2);
const cube = new THREE.Mesh(geometry, material);


const c1 = new THREE.BoxGeometry(2, 1, 2);

// top left / northwest
const c1o = new THREE.Mesh(c1, material);

// bottom left / southwest
const c2o = new THREE.Mesh(c1, material);

// top right / northeast
const c3o = new THREE.Mesh(c1, material);

// bottom right / southeast
const c4o = new THREE.Mesh(c1, material);

function floor50(num) {
    return Math.floor(num / 50) * 50;
}

function ceil50(num) {
    return Math.ceil(num / 50) * 50;
}

var breakInitialTerrainLock = false;
var crashed = false;
var aircraftWingLELine, aircraftWingTELine, aircraftBodyLine;

function terrainCollisionCheck() {
    cube.position.copy(currAircraftDisplacement);
    cube.position.y = 10;

    let cx, cz, fx, fz;
    cx = ceil50(cube.position.x);
    cz = ceil50(cube.position.z);
    fx = floor50(cube.position.x);
    fz = floor50(cube.position.z);

    if (Math.abs(currAircraftDisplacement.x) > (planewh / 2) || Math.abs(currAircraftDisplacement.z) > (planewh / 2)) {
        console.log("Out of Bounds!");
    }

    else {
        let pt1 = new THREE.Vector3(cx, planeHeightCoords[[cx, cz]], cz),
            pt2 = new THREE.Vector3(cx, planeHeightCoords[[cx, fz]], fz),
            pt3 = new THREE.Vector3(fx, planeHeightCoords[[fx, cz]], cz),
            pt4 = new THREE.Vector3(fx, planeHeightCoords[[fx, fz]], fz);
        c1o.position.copy(pt1);
        c2o.position.copy(pt2);
        c3o.position.copy(pt3);
        c4o.position.copy(pt4);

        let terrainPlane1 = new THREE.Plane(),
            terrainPlane2 = new THREE.Plane();
        terrainPlane1.setFromCoplanarPoints(c1o.position, c4o.position, c2o.position);
        terrainPlane2.setFromCoplanarPoints(c1o.position, c3o.position, c4o.position);

        aircraftWingLELine = new THREE.Line3(new THREE.Vector3(7.5, 0, 2.5).applyMatrix4(aircraft.matrixWorld), new THREE.Vector3(-7.5, 0, 2.5).applyMatrix4(aircraft.matrixWorld));
        aircraftWingTELine = new THREE.Line3(new THREE.Vector3(7.5, 0, -2.5).applyMatrix4(aircraft.matrixWorld), new THREE.Vector3(-7.5, 0, -2.5).applyMatrix4(aircraft.matrixWorld));
        aircraftBodyLine = new THREE.Line3(new THREE.Vector3(0, 0, 10).applyMatrix4(aircraft.matrixWorld), new THREE.Vector3(0, 0, -10).applyMatrix4(aircraft.matrixWorld));

        if (terrainPlane1.intersectsLine(aircraftWingLELine) ||
            terrainPlane2.intersectsLine(aircraftWingLELine) ||
            terrainPlane2.intersectsLine(aircraftWingTELine) ||
            terrainPlane1.intersectsLine(aircraftWingTELine) ||
            terrainPlane1.intersectsLine(aircraftBodyLine) ||
            terrainPlane2.intersectsLine(aircraftBodyLine)) {
            if (breakInitialTerrainLock === true) {
                console.log("TERRAIN");
                throttleElem.setAttribute('Value', 100);
                plane.currspeed = 0;
                crashed = true;
            }
        }
        else {
            breakInitialTerrainLock = true;
        }
    }
}



let currAircraftDisplacement = new THREE.Vector3(0, 0, 0);
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    aircraft.getWorldDirection(plane.nosedir);
    checkKP();
    aircraft.getWorldPosition(tempV);

    aircraft.getWorldPosition(currAircraftDisplacement);
    currAircraftDisplacement.add(plane.velocity);


    tempV.add(plane.velocity);
    aircraft.position.copy(tempV);

    controls.update();
    aircraftBodyBB.update();
    aircraftWingBB.update();
    aircraftTailBB.update();

    camera.getWorldPosition(tempCam);
    tempCam.add(plane.velocity);
    camera.position.copy(tempCam);

    aircraftBox3.copy(aircraft.geometry.boundingBox).applyMatrix4(aircraft.matrixWorld);
    aircraftBox3.copy(aircraft.geometry.boundingBox).applyMatrix4(aircraft.matrixWorld);

    terrainCollisionCheck();
}

animate();
