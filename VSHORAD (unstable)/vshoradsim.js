/*
v1.3a
*/



// import required modules
import * as THREE from "./modules/three.module.js";
import * as dat from "./modules/datgui/dat.gui.module.js";
import {
    OrbitControls
} from "./modules/OrbitControls.js";
import {
    GLTFLoader
} from "./modules/GLTFLoader.js";
import {
    OBB
} from "./modules/OBB.js"

var startSim = false;
var rightClicked = false;

// initialize scene, camera, renderer, and controls
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({
    alpha: true
});
var clock = new THREE.Clock();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 2, 0);
scene.add(camera);

const gui = new dat.GUI();
const worldSettings = {
    c130: {
        radius: 2000,
        gndspeed: 0.001,
    },

    missile: {
        proxFuse: 1.25,
    },

    operator:{
        zoomed:{
            focalLength: 160,
            dampingFactor: 0.01
        },
        normal:{
            focalLength: 20,
            dampingFactor: 0.05
        }
    }
};

const c130Folder = gui.addFolder("c130");
c130Folder.add(worldSettings.c130, "radius", 100, 3000);
c130Folder.add(worldSettings.c130, "gndspeed", 0.0001, 0.01);
const missileFolder = gui.addFolder("missile");
missileFolder.add(worldSettings.missile, "proxFuse", 1.25, 5);
const operatorFolder = gui.addFolder("operator");
const zoomedFolder = operatorFolder.addFolder("zoomed");
zoomedFolder.add(worldSettings.operator.zoomed, "focalLength", 50, 250);
zoomedFolder.add(worldSettings.operator.zoomed, "dampingFactor", 0.001, 0.1);
const normalFolder = operatorFolder.addFolder("noraml");
normalFolder.add(worldSettings.operator.normal, "focalLength", 0, 50);
normalFolder.add(worldSettings.operator.normal, "dampingFactor", 0.01, 0.1);

// create skybox
const sbLoad = new THREE.CubeTextureLoader();
const sbTexture = sbLoad.load([
    "./assets/skybox/bg.png",
    "./assets/skybox/bg.png",
    "./assets/skybox/top.png",
    "./assets/skybox/top.png",
    "./assets/skybox/bg.png",
    "./assets/skybox/bg.png"
]);
scene.background = sbTexture

// add plane
const planesize = 100
const wireplaneMesh = new THREE.PlaneGeometry(1000, 1000, planesize, planesize);
const wireplaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x008800,
    side: THREE.DoubleSide,
    wireframe: true,
});
const wireplane = new THREE.Mesh(wireplaneMesh, wireplaneMaterial);
wireplane.rotation.set(Math.PI / 2, 0, 0);
wireplane.position.set(0, 0.05, 0);
scene.add(wireplane);

const wireplaneMeshArray = wireplane.geometry.attributes.position.array;

var prev = 0;
for (let i = 0; i < wireplaneMeshArray.length; i += 3) {
    const z = wireplaneMeshArray[i + 2];

    // noob way to smoothen plane
    var rdm = 0;
    var weight = Math.random();
    var posneg = Math.random();
    if (posneg > 0.5) {
        rdm = weight;
    } else {
        rdm = -weight;
    }
    wireplaneMeshArray[i + 2] = z + prev + rdm;
    prev = rdm;
}

// magic calculation to find index of node at 0, 0 given that planesize is even number
var midnode = (((planesize + 1) * (planesize / 2)) + (planesize / 2)) * 3;

const properplaneMesh = wireplaneMesh.clone()
const properplaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x74B06A,
    side: THREE.DoubleSide,
})
const properplane = new THREE.Mesh(properplaneMesh, properplaneMaterial);
properplane.rotation.set(Math.PI / 2, 0, 0);

wireplane.position.y += wireplaneMeshArray[midnode + 2]
properplane.position.y += wireplaneMeshArray[midnode + 2]

scene.add(properplane)
renderer.render(scene, camera);

// add basic target mesh
const targetMesh = new THREE.PlaneGeometry(10, 10);
const targetMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF0000,
    side: THREE.DoubleSide
});
const target = new THREE.Mesh(targetMesh, targetMaterial);
target.position.set(-50, 0, 200);
target.lookAt(camera);
target.rotation.set(0, 0, Math.PI / 2);
scene.add(target);

const targetBB = new THREE.Box3();
target.geometry.computeBoundingBox();
targetBB.copy(target.geometry.boundingBox).applyMatrix4(target.matrixWorld);

let controls;

function setControls() {
    camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', () => {
        renderer.render(scene, camera)
    });

    // change from default camera settings
    controls.target.set(0.5, 2.6, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = 10 * (Math.PI / 12);
    controls.minPolarAngle = 5 * (Math.PI / 12);
}
setControls();

// load 3d models
const loader = new GLTFLoader();

const missileLight = new THREE.PointLight(0xffbb11, 6, 1);
scene.add(missileLight);
missileLight.position.set(0, -50, 0);

// missile
function loadMissile() {
    loader.load("assets/rbs70missile_scaled_1_5_(EXPORT).glb", (gltf) => {
        const missileMesh = gltf.scene;
        missileMesh.scale.set(missileMesh.scale.x * 0.1, missileMesh.scale.y * 0.1, missileMesh.scale.z * 0.1);
        missileMesh.position.set(0, 2, 0);
        missileMesh.name = "MissileMesh";
        scene.add(missileMesh);
        renderer.render(scene, camera);
        const clips = gltf.animations;
        const missileMixer = new THREE.AnimationMixer(gltf.scene);

        // get clip for unfolding fins
        clips.forEach((iclip) => {
            const clip = gltf.animations.find((clip) => clip.name === iclip.name);
            const finDeploy = missileMixer.clipAction(clip);
            finDeploy.clampWhenFinished = true;
            finDeploy.loop = THREE.LoopOnce;
            finDeploy.play();
            renderer.render(scene, camera)
        });

        // animate fins
        function missileAnim() {
            missileMixer.timeScale = 10;
            missileMixer.update(clock.getDelta());
            requestAnimationFrame(missileAnim);
        }
        missileAnim();

        renderer.render(scene, camera);
    });
}

// weapon
loader.load("assets/rbs70_WEAPON_scaled_1_5_(EXPORT).glb", (gltf) => {
    const weaponMesh = gltf.scene;
    weaponMesh.scale.set(weaponMesh.scale.x * 0.2, weaponMesh.scale.y * 0.2, weaponMesh.scale.z * 0.2);
    weaponMesh.position.set(0, 1.8, 0);
    weaponMesh.name = "WeaponMesh";
    scene.add(weaponMesh);
    renderer.render(scene, camera);
});

// stand
loader.load("assets/rbs70_STAND_scaled_1_5_(EXPORT).glb", (gltf) => {
    const standMesh = gltf.scene;
    standMesh.scale.set(standMesh.scale.x * 0.2, standMesh.scale.y * 0.2, standMesh.scale.z * 0.2);
    standMesh.name = "StandMesh";
    scene.add(standMesh);
    renderer.render(scene, camera);
});

// seat
loader.load("assets/rbs70_SEAT_scaled_1_5_(EXPORT).glb", (gltf) => {
    const seatMesh = gltf.scene;
    seatMesh.scale.set(seatMesh.scale.x * 0.2, seatMesh.scale.y * 0.2, seatMesh.scale.z * 0.2);
    seatMesh.name = "SeatMesh";
    scene.add(seatMesh);
    renderer.render(scene, camera);
});

// c130
loader.load("assets/c130_(EXPORT).glb", (gltf) => {
    const c130Mesh = gltf.scene;

    c130Mesh.name = "c130Mesh";
    scene.add(c130Mesh);

    // init position and update scene
    c130Mesh.position.set(0, 20, 0);
    renderer.render(scene, camera);
    c130anim();
});

// c130 calcaulate bounding box + movement
var c130t = 0;
var c130hit = false;

function c130anim() {
    if(c130hit){return}
    const c130Mesh = scene.children.find(obj => obj.name === "c130Mesh").children[0];
    c130Mesh.geometry.computeBoundingBox();

    // circular movement using sine and cosine
    c130t += worldSettings.c130.gndspeed;
    c130Mesh.position.x = worldSettings.c130.radius * Math.cos(c130t) + 0;
    c130Mesh.position.z = worldSettings.c130.radius * Math.sin(c130t) + 0;
    // make c130 face properly (for circular movement)
    c130Mesh.lookAt(0, 0, 0);
    c130Mesh.rotateX(Math.PI / 8);

    // use obb for hitbox
    c130Mesh.userData.obb = new OBB();
    c130Mesh.userData.obb.applyMatrix4(c130Mesh.matrixWorld);
    c130Mesh.userData.obb.halfSize = new THREE.Vector3(10, 10, 10);
    // --!-- without the above halfsize multiplier, it breaks, as you will need to hit in the direct center of the C-130 for it to register a hit

    requestAnimationFrame(c130anim);
}

function c130hitcam(){
    const c130pcam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
    const c130Mesh = scene.children.find(obj => obj.name === "c130Mesh").children[0];
    c130pcam.position.set(c130Mesh.position.x, c130Mesh.position.y + 2, c130Mesh.position.z);
}

// add lighting to scene
const ambLight = new THREE.AmbientLight(0x404040, 3.35);
scene.add(ambLight);

const ptLight = new THREE.PointLight(0xffffbb, 5, 0, 1);
ptLight.position.set(2, 5, 5);
scene.add(ptLight);

var targetMoveRight = true;

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    // animate moving target
    if (target.position.x > 100) {
        targetMoveRight = true;
    } else if (target.position.x < -100) {
        targetMoveRight = false;
    }
    if (targetMoveRight) {
        target.position.x -= 0.1;
    } else {
        target.position.x += 0.1;
    }

    // set proper rotation for target
    target.lookAt(camera);
    target.rotation.set(0, 0, Math.PI / 2);

    // update bounding box for target
    target.geometry.computeBoundingBox();
    targetBB.copy(target.geometry.boundingBox).applyMatrix4(target.matrixWorld);

    if (controls === 0) {
        rotateWpn();
    }
    controls.update();
}
animate();

// rbs70 weapon animation
function rotateWpn() {
    // select appropriate meshes
    const WeaponMesh = scene.children.find(obj => obj.name === "WeaponMesh");
    const SeatMesh = scene.children.find(obj => obj.name === "SeatMesh");

    // create vectors, align to camera (where player looks)
    var alignWpnVector = new THREE.Vector3();
    var focalWpn = new THREE.Vector3(
        WeaponMesh.position.x + camera.getWorldDirection(alignWpnVector).x,
        WeaponMesh.position.y + camera.getWorldDirection(alignWpnVector).y,
        WeaponMesh.position.z + camera.getWorldDirection(alignWpnVector).z,
    );
    var focalSeat = new THREE.Vector3(
        SeatMesh.position.x + camera.getWorldDirection(alignWpnVector).x,
        SeatMesh.position.y,
        SeatMesh.position.z + camera.getWorldDirection(alignWpnVector).z,
    );
    
    // update weapon and seat rotation
    WeaponMesh.lookAt(focalWpn);
    SeatMesh.lookAt(focalSeat);
}

var shiftDown = false;
const cageNotify = document.getElementById("cage");

function cageActions() {
    if (!shiftDown) {
        // caged
        cageNotify.innerText = "-CAGED-";
        cageNotify.style.background = "#dd2222";
    } else {
        // uncaged
        cageNotify.innerText = "UNCAGED";
        cageNotify.style.background = "#22cc55";
    }
}

var fired = false;
var shotout = false;
var shotend = false;

const missileBox = new THREE.Box3();

const loadIndicate = document.getElementById("loadIndicate");
const tempCross = document.getElementById("tempCross");
var currdist = 0;
var rotateAnim = 0;

const alertDoc = document.getElementById("alert");

// create missile track line
const missileTrackLine = [];
missileTrackLine.push(new THREE.Vector3(0, 2, 0));
var mTLcount = 0;
const mTLMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 50
});
var mTLGeometry = new THREE.BufferGeometry().setFromPoints(missileTrackLine);
var TrackLine = new THREE.Line(mTLGeometry, mTLMaterial);

var speedclock = new THREE.Clock(false)
var currspeed = 50;
var curraccel = 57;
var s, a, t;

function missiledist(u){
    if(u > 686){
        curraccel = -10;
    }
    a = curraccel;
    t = speedclock.getDelta();
    
    // suvat equations! woohoo!
    // s = ut + 0.5at^2
    // v = u + at
    s = u * t + 0.5 * a * t * t;
    currspeed = u + a * t;
    return s;
}

function fire() {
    // logic checks
    if (!fired && shiftDown && !shotend) {
        requestAnimationFrame(fire);

        if (!shotout) {
            // set vars for missile fired
            loadMissile();
            animate();
            scene.add(missileLight);
            missileLight.intensity = 10;
            shotout = true;
            console.log("- ^ - Missile fired");

            // update UI
            loadIndicate.style.background = "yellow";
            loadIndicate.innerText = "In-Flight"
            loadIndicate.style.color = "black";

            
            alertDoc.innerText = "";
            alertDoc.style.opacity = "0";
            speedclock.start();
        }

        // load mesh for missile + calculate bounding box
        const MissileMesh = scene.children.find(obj => obj.name === "MissileMesh");
        const MissileFuse = MissileMesh.children.find(obj => obj.name === "Fuse");
        MissileFuse.geometry.computeBoundingBox();
        missileBox.copy(MissileFuse.geometry.boundingBox).applyMatrix4(MissileFuse.matrixWorld);

        // if proximity fuse, scale bounding box
        missileBox.expandByScalar(worldSettings.missile.proxFuse);

        // check for successful hit
        const c130Mesh = scene.children.find(obj => obj.name === "c130Mesh").children[0];
        if(missileBox.intersectsBox(targetBB) || c130Mesh.userData.obb.intersectsBox3(missileBox)){
            missileLight.intensity = 500;
            missileLight.distance = 10;
            shotend = true;
            console.log("- - - SUCCESSFUL HIT - - -");
            tempCross.innerHTML = "------ <br />| HIT | <br />------";

            mTLGeometry = new THREE.BufferGeometry().setFromPoints(missileTrackLine);
            TrackLine = new THREE.Line(mTLGeometry, mTLMaterial);
            scene.add(TrackLine);
        }

        if(c130Mesh.userData.obb.intersectsBox3(missileBox)){
            c130hit = true;
            c130hitcam();
        }

        // animation + movement of missile
        var alignWpnVector = new THREE.Vector3();
        var longFocal = new THREE.Vector3();
        var focalWpn = new THREE.Vector3(
            camera.getWorldDirection(alignWpnVector).x,
            camera.getWorldDirection(alignWpnVector).y,
            camera.getWorldDirection(alignWpnVector).z,
        );
        longFocal = focalWpn.clone();
        focalWpn.normalize();
        focalWpn.multiplyScalar(currdist);
        focalWpn.setY(focalWpn.y + 2);

        currdist += missiledist(currspeed);

        var missilePt = new THREE.Vector3();
        MissileMesh.getWorldPosition(missilePt);
        MissileMesh.lookAt(longFocal.multiplyScalar(1000));

        MissileMesh.rotateZ(rotateAnim * (Math.PI / 180));
        rotateAnim += 2;

        // --!-- this is literally just teleporting the missile to wherever you're looking at, so basically its unrealistic cause you can zoom zoom zoom it all around the place, unlike a real missile
        missileLight.position.set(MissileMesh.position.x - 0.5, MissileMesh.position.y, MissileMesh.position.z);
        MissileMesh.position.set(focalWpn.x, focalWpn.y, focalWpn.z);

        // missile track line
        if (mTLcount === 10) {
            missileTrackLine.push(missilePt);
            mTLcount = 0;
        } else {
            mTLcount += 1;
        }
        
        // check for missile max range
        // intercept range of 9000m, altitude max of ~5000m
        if(Math.round(missilePt.length()) > 9000 || Math.round(MissileMesh.position.y) > 5500){
            shotend = true;
            console.log("- ! - Max Range Exceeded");
            mTLGeometry = new THREE.BufferGeometry().setFromPoints(missileTrackLine);
            TrackLine = new THREE.Line(mTLGeometry, mTLMaterial);

            scene.add(TrackLine);
            
            tempCross.innerHTML = "------ <br />|-=!=-|<br />------";
            alertDoc.innerText = "Max Range";
            alertDoc.style.opacity = "1";
            alertDoc.style.background = "#dd2222";
        }

    } else if (fired || shotout) {
        console.log("- ! - No munition");

        // update UI
        loadIndicate.style.background = "#dd2222";
        loadIndicate.innerText = "Empty"
        loadIndicate.style.color = "white";
    } else {
        console.log("- ! - CAGED, Cannot fire");
        
        alertDoc.innerText = "Uncage to fire!";
        alertDoc.style.opacity = "1";
        alertDoc.style.background = "#dd2222";
    }
}

// render when page loads
renderer.render(scene, camera);

document.addEventListener("contextmenu", () => {
    if (!startSim) {
        return
    };
    rightClicked = !rightClicked;

    if (rightClicked) {
        // zoom in
        camera.setFocalLength(worldSettings.operator.zoomed.focalLength);
        controls.dampingFactor = worldSettings.operator.zoomed.dampingFactor;

    } else {
        // zoom out
        camera.setFocalLength(worldSettings.operator.normal.focalLength);
        controls.dampingFactor = worldSettings.operator.normal.dampingFactor;
    }
    camera.updateProjectionMatrix();
});

document.addEventListener("keypress", (e) => {
    switch (e.key) {
        // "start" actions
        case " ":
            console.log("- - - START - - -")

            startSim = true;
            controls.enableDamping = true;

            controls.dampingFactor = 0.05;
            controls.rotateSpeed = 0.2;

            rotateWpn();
            cageActions();

            // update UI
            loadIndicate.style.background = "#22cc55";
            loadIndicate.innerText = "Loaded"
            loadIndicate.style.color = "white";

            tempCross.innerHTML = "------ <br />| + | <br />------";
            
            alertDoc.innerText = "";
            alertDoc.style.opacity = "0";

            document.getElementById("notifsbg").remove();

            break;

            // fire weapon
        case "c":
            if (!startSim) {
                return
            };
            alertDoc.innerText = "";
            alertDoc.style.opacity = "0";
            fire();
            break;

            // reload weapon
        case "r":
            if (!startSim) {
                return
            };

            // reset vars for firing
            shotout = false;
            fired = false;
            shotend = false;
            currdist = 0;
            currspeed = 50;
            curraccel = 57;
            speedclock.stop();

            // restart c130 anim
            if(c130hit){
                c130hit = false;
                c130anim();
            }

            // reset missile
            missileTrackLine.length = 0;
            missileTrackLine.push(new THREE.Vector3(0, 2, 0));
            scene.remove(TrackLine);

            const WeaponMesh = scene.children.find(obj => obj.name === "MissileMesh");

            scene.remove(missileLight);
            scene.remove(WeaponMesh);
            console.log("--- Missile reset ---")

            // update UI
            loadIndicate.style.background = "#22cc55";
            loadIndicate.innerText = "Loaded"
            loadIndicate.style.color = "white";

            tempCross.innerHTML = "------ <br />| + | <br />------";

            break;

    }
})

function flash1(){
    alertDoc.style.background = (alertDoc.style.background == 'rgb(34, 204, 85)' ? '#dd2222' : '#22cc55');
}
setInterval(flash1, 800);

document.addEventListener("keydown", (e) => {
    if (!startSim) {
        return
    };
    if (e.key === "Shift") {
        shiftDown = true;
        cageActions();
    }

    if (e.key === "C") {
        if (shotout || fired) {
            console.log("- ! - No munition")
        }
        fire();
    }
})

document.addEventListener("keyup", (e) => {
    if (!startSim) {
        return
    };
    if (e.key === "Shift") {
        shiftDown = false;
        if (shotout) {
            shotend = true;
        };
        cageActions();
    }
    if (e.key === "c") {
        cageActions();
    }
})

document.addEventListener("mousemove", (e) => {
    rotateWpn();
})

function winresize(){
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

window.addEventListener('resize', (e) => {
    setInterval(winresize, 500);
});

// fps display
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
