import { OrbitControls } from './OrbitControls.js';
import * as THREE from './three.module.js';
import { createNoise2D } from './simplex-noise.js';
import { SAM } from './sam.js';

var calibrateClick = true;
var calibrateDevice = [0, 0, 0];

class Airplane {
    // f-15
    constructor() {
        this.displacement = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.prevvelo = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.nosedir = new THREE.Vector3(0, 0, 0);
        this.maxspeed = 5;
        this.maxaccel = 0.14;
        this.currspeed = 0;
        this.curraccel = 0;
        this.mass = 20410000;
        this.hit = false;
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
        this.updateDisp();
    }

    updateDisp() {
        this.displacement.add(this.velocity);
    }
}

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x588bc4);

var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 25000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.needsUpdate = true;

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
    // add plane
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

        wireGroundMeshArray[i + 2] = z + plane2dNoise(x / 2000, y / 2000) * 400;
        planeHeightCoords[[x, y]] = -wireGroundMeshArray[i + 2];
    }

    
    const properGroundMesh = wireGroundMesh.clone()
    const properGroundMaterial = new THREE.MeshPhongMaterial({
        color: 0x74B06A,
        side: THREE.DoubleSide
    })
    properGround = new THREE.Mesh(properGroundMesh, properGroundMaterial);
    properGround.receiveShadow = true;
    properGround.rotation.set(Math.PI / 2, 0, 0);
    scene.add(properGround);
}

generateGround();



const directionalLight = new THREE.DirectionalLight(0x404040, 1.5);
// lights
function generateLights() {
    const directionalLightLimits = 32;
    directionalLight.castShadow = true;
    directionalLight.position.set(50, 800, 100);
    
    directionalLight.shadow.mapSize.width = 512/2;
    directionalLight.shadow.mapSize.height = 512/2;
    directionalLight.shadowCameraLeft = -directionalLightLimits;
    directionalLight.shadowCameraRight = directionalLightLimits;
    directionalLight.shadowCameraTop = directionalLightLimits;
    directionalLight.shadowCameraBottom = -directionalLightLimits;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 10000;

    scene.add(directionalLight);

    const light = new THREE.AmbientLight(0x404040, 2);
    scene.add(light);
}


generateLights();



const aircraftBodyGeom = new THREE.CylinderGeometry(1, 1, 20, 8);
const aircraftWingGeom = new THREE.BoxGeometry(15, 1, 5);
const aircraftNoseGeom = new THREE.ConeGeometry(2, 2, 8);
const aircraftTailGeom = new THREE.BoxGeometry(1, 4, 3);

const material = new THREE.MeshPhongMaterial({
    color: 0xb3afaf,
    reflectivity: 0.5    
});

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

aircraft.traverse((e) => {
    e.castShadow = true;
    e.receiveShadow = true;
})

directionalLight.target = aircraft;

const aircraftBox3 = new THREE.Box3();
aircraftBox3.setFromObject(aircraft);

camera.position.set(0, 50, -70);
aircraft.position.y = 20;
controls.target = aircraft.position;
controls.update();

// key presses
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

const rollSpeed = 0.02;
const yawSpeed = 0.02;
const pitchSpeed = 0.02;



// Mobile Functionality
const mobileCalibrate = document.getElementById("mobileCalibrate");
mobileCalibrate.ontouchstart = function(){
    calibrateClick = true;
}

const mobileReset = document.getElementById("mobileReset");
mobileReset.ontouchstart = function(){
    if (crashed || plane.hit) {
        let tempV = new THREE.Vector3(0, 0, 0);
        aircraft.getWorldPosition(tempV);
        tempV.add(new THREE.Vector3(0, 50, 0));
        aircraft.position.copy(tempV);
        camera.position.add(new THREE.Vector3(0, 50, 0));
        crashed = false;
        plane.hit = false;
    }
}

let correctedAlpha, correctedBeta, correctedGamma;

window.addEventListener('deviceorientation', (event) => {
    if(calibrateClick){
        calibrateClick = false;
        calibrateDevice = [event.alpha, event.beta, event.gamma];
    }

    correctedAlpha = (event.alpha - calibrateDevice[0]) % 360;
    correctedBeta = (event.beta - calibrateDevice[1]) % 180;
    correctedGamma =(event.gamma - calibrateDevice[2]) % 90;

    // Pitch
    aircraft.rotateX(correctedGamma / 1500);

    // Roll
    aircraft.rotateZ(correctedBeta / 750);
});

const mobileYaw = document.getElementById("mobileYaw");
let mobileYawSpeed;
setInterval( ()=>{
    mobileYawSpeed = - (mobileYaw.value - 50) / 2500;
    aircraft.rotateY(mobileYawSpeed);
}, 25)

const throttleElem = document.getElementById("throttleIndicator");

const mobileThrottle = document.getElementById("mobileThrottle");
mobileThrottle.oninput = function(){
    throttleElem.setAttribute('Value', this.value);
}

function checkKP() {
    if ('KeyW' in KeyPressed) {
        aircraft.rotateX(pitchSpeed);
    }

    if ('KeyS' in KeyPressed) {
        aircraft.rotateX(-pitchSpeed);
    }

    if ('KeyA' in KeyPressed) {
        aircraft.rotateZ(-rollSpeed);
    }


    if ('KeyD' in KeyPressed) {
        aircraft.rotateZ(rollSpeed);
    }

    if ('KeyQ' in KeyPressed) {
        aircraft.rotateY(yawSpeed);
    }

    if ('KeyE' in KeyPressed) {
        aircraft.rotateY(-yawSpeed);
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

    if ('KeyR' in KeyPressed && (crashed || plane.hit)) {
        let tempV = new THREE.Vector3(0, 0, 0);
        aircraft.getWorldPosition(tempV);
        tempV.add(new THREE.Vector3(0, 50, 0));
        aircraft.position.copy(tempV);
        camera.position.add(new THREE.Vector3(0, 50, 0));
        crashed = false;
        plane.hit = false;
    }

    plane.updateAccel(currThrottle);
}



let tempCam = new THREE.Vector3;

const geometry = new THREE.BoxGeometry(2, 20, 2);
const cube = new THREE.Mesh(geometry, material);

const invisMaterial = new THREE.MeshPhongMaterial({
    color: 0xb3afaf,
    transparent: true,
    opacity: 0
});

const c1 = new THREE.BoxGeometry(2, 1, 2);

// top left / northwest
const c1o = new THREE.Mesh(c1, invisMaterial);

// bottom left / southwest
const c2o = new THREE.Mesh(c1, invisMaterial);

// top right / northeast
const c3o = new THREE.Mesh(c1, invisMaterial);

// bottom right / southeast
const c4o = new THREE.Mesh(c1, invisMaterial);

scene.add( c1o );
scene.add( c2o );
scene.add( c3o );
scene.add( c4o );


function floor50(num) {
    return Math.floor(num / 50) * 50;
}

function ceil50(num) {
    return Math.ceil(num / 50) * 50;
}

var breakInitialTerrainLock = false;
var crashed = false;
var aircraftWingLELine, aircraftWingTELine, aircraftBodyLine;


function generateTerrainPlanes(objectPos) {
    let cx, cz, fx, fz;
    cx = ceil50(objectPos.x);
    cz = ceil50(objectPos.z);
    fx = floor50(objectPos.x);
    fz = floor50(objectPos.z);

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

    return [terrainPlane1, terrainPlane2];
}

function terrainCollisionCheckAircraft() {

    cube.position.copy(currAircraftDisplacement);
    cube.position.y = 10;

    const terrainPlaneArray = generateTerrainPlanes(cube.position);
    let terrainPlane1 = terrainPlaneArray[0],
        terrainPlane2 = terrainPlaneArray[1];

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

let tempSphere = new THREE.Sphere();

function terrainCollisionCheckSAM(SAMobj) {
    cube.position.copy(SAMobj.displacement);

    const terrainPlaneArray = generateTerrainPlanes(cube.position);
    let terrainPlane1 = terrainPlaneArray[0],
        terrainPlane2 = terrainPlaneArray[1];

    tempSphere.set(SAMobj.displacement, 1)

    if (terrainPlane1.intersectsSphere(tempSphere) ||
        terrainPlane2.intersectsSphere(tempSphere)) {
        SAMobj.collided = true;
        console.log("SAM collision with terrain!");
    }
}




const bgeometry = new THREE.SphereGeometry(5, 8, 8);
const bmaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

const pgeometry = new THREE.SphereGeometry(4, 8, 8);
const pmaterial = new THREE.MeshBasicMaterial({ color: 0x00ff34 });

const rangegeometry = new THREE.SphereGeometry(700, 32, 16);
const rangematerial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
});

let ships = [];
let predicted;

let bsphereArr = [],
    psphereArr = [],
    rangesphereArr = [];

var samSiteX, samSiteZ, samSiteCoords;

for(let i = 0; i < 3; i++){
    samSiteX = ceil50(Math.random()*10000 - 5000);
    samSiteZ = ceil50(Math.random()*10000 - 5000);
    samSiteCoords = [samSiteX-1, planeHeightCoords[[samSiteX, samSiteZ]]+10, samSiteZ-1];
    
    ships.push(new SAM(samSiteCoords[0], samSiteCoords[1], samSiteCoords[2], crypto.randomUUID().toUpperCase()));

    let bsphere = new THREE.Mesh(bgeometry, bmaterial);
    let psphere = new THREE.Mesh(pgeometry, pmaterial);
    let rangesphere = new THREE.Mesh(rangegeometry, rangematerial);

    bsphere.name = "bsphere" + i.toString();
    psphere.name = "psphere" + i.toString();
    rangesphere.name = "rangesphere" + i.toString();

    bsphereArr.push(bsphere);
    psphereArr.push(psphere);
    rangesphereArr.push(rangesphere);

    scene.add(bsphere);
    scene.add(psphere);
    scene.add(rangesphere);

    rangesphere.position.copy(new THREE.Vector3(samSiteCoords[0], samSiteCoords[1], samSiteCoords[2]));

}

const distdiffe = document.getElementById("distdiff");
const speede = document.getElementById("speed");

let currAircraftDisplacement = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    aircraft.getWorldDirection(plane.nosedir);
    checkKP();

    aircraft.getWorldPosition(currAircraftDisplacement);
    currAircraftDisplacement.add(plane.velocity);

    plane.displacement.copy(currAircraftDisplacement);

    directionalLight.position.copy(plane.displacement);
    directionalLight.position.y += 100;
    directionalLight.position.x += 30;
    directionalLight.position.z += 30;

    aircraft.position.copy(currAircraftDisplacement);

    controls.update();

    camera.getWorldPosition(tempCam);
    tempCam.add(plane.velocity);
    camera.position.copy(tempCam);
    
    camera.updateProjectionMatrix();

    aircraftBox3.copy(aircraft.geometry.boundingBox).applyMatrix4(aircraft.matrixWorld);
    aircraftBox3.copy(aircraft.geometry.boundingBox).applyMatrix4(aircraft.matrixWorld);

    // SAM
    let innerHTMLstr = "";
    for(let i = 0; i < ships.length; i++){
        innerHTMLstr += ships[i].displacement.distanceTo(plane.displacement);
        innerHTMLstr += "<br/>";
        
        // draw predicted sphere
        try {
            psphereArr[i].position.copy(predicted)
        }
        catch { }

        
        let res = ships[i].radarGuide(plane);

        if (res === true && !plane.hit) {
            plane.hit = true;
            throttleElem.setAttribute('Value', 100);
            plane.currspeed = 0;
            console.log("Aircraft hit by SAM", ships[i].uuid)
        }

        if (ships[i].collided === false && (ships[i].maxspeed - ships[i].decayVelo) != 0) {
            // update positions of objects
            ships[i].update();

            // draw SAM object sphere
            bsphereArr[i].position.copy(ships[i].displacement);

            try {
                predicted = ships[i].targetpos;
            }
            catch { console.log("ERROR") }
            terrainCollisionCheckSAM(ships[i]);
        }

    }
    distdiffe.innerHTML = innerHTMLstr;
    speede.innerText = plane.currspeed;

    terrainCollisionCheckAircraft();
}

animate();
