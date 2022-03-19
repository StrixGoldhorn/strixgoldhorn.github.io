// import required modules
import * as THREE from "./modules/three.module.js";
import * as dat from "./modules/datgui/dat.gui.module.js";
import {
    OrbitControls
} from "./modules/OrbitControls.js";
import {
    GLTFLoader
} from './modules/GLTFLoader.js';

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
        speed: 1,
        proxFuse: 1.25,
    }
};

const c130Folder = gui.addFolder("c130");
c130Folder.add(worldSettings.c130, 'radius', 100, 3000);
c130Folder.add(worldSettings.c130, 'gndspeed', 0.0001, 0.01);
const missileFolder = gui.addFolder("missile");
missileFolder.add(worldSettings.missile, 'speed', 0.1, 10);
missileFolder.add(worldSettings.missile, 'proxFuse', 1.25, 5);

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

const planesize = 20

// create objects and add to scene
const wireplaneMesh = new THREE.PlaneGeometry(100, 100, planesize, planesize);
const wireplaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444,
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
    const x = wireplaneMeshArray[i];
    const y = wireplaneMeshArray[i + 1];
    const z = wireplaneMeshArray[i + 2];

    // noob way to smoothen plane
    var rdm = 0;
    var weight = Math.random();
    var posneg = Math.random();
    if (posneg > 0.25) {
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
    controls.target.set(0.5, 2.6, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = 8 * (Math.PI / 12);
    controls.minPolarAngle = 5 * (Math.PI / 12);
}
setControls();

// load 3d models
const loader = new GLTFLoader();

const missileLight = new THREE.PointLight(0xffbb11, 10, 2);
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

        clips.forEach((iclip) => {
            const clip = gltf.animations.find((clip) => clip.name === iclip.name);
            const finDeploy = missileMixer.clipAction(clip);
            finDeploy.clampWhenFinished = true;
            finDeploy.loop = THREE.LoopOnce;
            finDeploy.play();
            renderer.render(scene, camera)
        });

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

    // shrink else too big
    c130Mesh.scale.set(c130Mesh.scale.x * 0.2, c130Mesh.scale.y * 0.2, c130Mesh.scale.z * 0.2);
    c130Mesh.name = "c130Mesh";
    scene.add(c130Mesh);

    c130Mesh.position.set(0, 20, 0);
    renderer.render(scene, camera);
    c130anim();
});

// add bounding box for c130
const c130BB = new THREE.Box3();
const c130BBHelper = new THREE.Box3Helper(c130BB, 0xffff00);
scene.add(c130BBHelper);

// c130 calcaulate bounding box + movement
var c130t = 0;

function c130anim() {
    const c130Mesh = scene.children.find(obj => obj.name === "c130Mesh").children[0];
    c130Mesh.geometry.computeBoundingBox();
    c130BB.copy(c130Mesh.geometry.boundingBox).applyMatrix4(c130Mesh.matrixWorld);

    // roughly decrease bounding box to better fit mesh
    c130BB.expandByScalar(-1.5);

    // circular movement using sine and cosine
    c130t += worldSettings.c130.gndspeed;
    c130Mesh.position.x = worldSettings.c130.radius * Math.cos(c130t) + 0;
    c130Mesh.position.z = worldSettings.c130.radius * Math.sin(c130t) + 0;

    // make c130 face properly (for circular movement)
    c130Mesh.lookAt(0, 0, 0);
    c130Mesh.rotateX(Math.PI / 8);

    requestAnimationFrame(c130anim)
}

// add lighting to scene
const ambLight = new THREE.AmbientLight(0x404040, 3.35);
scene.add(ambLight);

const ptLight = new THREE.PointLight(0xffffbb, 5, 0, 1);
ptLight.position.set(2, 5, 5);
scene.add(ptLight);

// should be renamed as targetMoveLeft
var targetMoveRight = false;

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    // animate moving target
    if (target.position.x === 100) {
        targetMoveRight = true;
    } else if (target.position.x === -100) {
        targetMoveRight = false;
    }
    if (targetMoveRight) {
        target.position.x -= 0.05;
    } else {
        target.position.x += 0.05;
    }
    target.lookAt(camera);
    target.rotation.set(0, 0, Math.PI / 2);

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
    const WeaponMesh = scene.children.find(obj => obj.name === "WeaponMesh");
    const SeatMesh = scene.children.find(obj => obj.name === "SeatMesh");
    var alignWpnVector = new THREE.Vector3()
    var focalWpn = new THREE.Vector3(
        WeaponMesh.position.x + camera.getWorldDirection(alignWpnVector).x,
        WeaponMesh.position.y + camera.getWorldDirection(alignWpnVector).y,
        WeaponMesh.position.z + camera.getWorldDirection(alignWpnVector).z,
    )
    WeaponMesh.lookAt(focalWpn);

    var focalSeat = new THREE.Vector3(
        SeatMesh.position.x + camera.getWorldDirection(alignWpnVector).x,
        SeatMesh.position.y,
        SeatMesh.position.z + camera.getWorldDirection(alignWpnVector).z,
    )
    SeatMesh.lookAt(focalSeat);
    requestAnimationFrame(rotateWpn);
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
var currspeed = 0;
var rotateAnim = 0;

const missileTrackLine = []
var mTLcount = 0;
const mTLMaterial = new THREE.LineBasicMaterial({
    color: 0xff00ff,
});
var mTLGeometry = new THREE.BufferGeometry().setFromPoints(missileTrackLine);
var TrackLine = new THREE.Line(mTLGeometry, mTLMaterial);

function fire() {
    // logic checks
    if (!fired && shiftDown && !shotend) {
        requestAnimationFrame(fire);

        if (!shotout) {
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
        }

        // load mesh for missile + calculate bounding box
        const MissileMesh = scene.children.find(obj => obj.name === "MissileMesh");
        const MissileFuse = MissileMesh.children.find(obj => obj.name === "Fuse");
        MissileFuse.geometry.computeBoundingBox();
        missileBox.copy(MissileFuse.geometry.boundingBox).applyMatrix4(MissileFuse.matrixWorld);

        // if proximity fuse, scale bounding box
        missileBox.expandByScalar(worldSettings.missile.proxFuse);

        // check for successful hit
        if (missileBox.intersectsBox(targetBB) || missileBox.intersectsBox(c130BB)) {
            missileLight.intensity = 500;
            missileLight.distance = 10;
            shotend = true;
            console.log("- - - SUCCESSFUL HIT - - -");
            tempCross.innerHTML = "------ <br />| HIT | <br />------";

            mTLGeometry = new THREE.BufferGeometry().setFromPoints(missileTrackLine);
            TrackLine = new THREE.Line(mTLGeometry, mTLMaterial);

            scene.add(TrackLine);
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
        focalWpn.multiplyScalar(currspeed);
        focalWpn.setY(focalWpn.y + 2);
        currspeed += worldSettings.missile.speed;

        var missilePt = new THREE.Vector3();
        MissileMesh.getWorldPosition(missilePt);
        MissileMesh.lookAt(longFocal.multiplyScalar(1000));

        MissileMesh.rotateZ(rotateAnim * (Math.PI / 180));
        rotateAnim += 2;

        missileLight.position.set(MissileMesh.position.x - 0.5, MissileMesh.position.y, MissileMesh.position.z);
        MissileMesh.position.set(focalWpn.x, focalWpn.y, focalWpn.z);

        // missile track line
        if (mTLcount === 10) {
            missileTrackLine.push(missilePt);
            mTLcount = 0;
        } else {
            mTLcount += 1;
        }

    } else if (fired || shotout) {
        console.log("- ! - No munition");

        // update UI
        loadIndicate.style.background = "#dd2222";
        loadIndicate.innerText = "Empty"
        loadIndicate.style.color = "white";
    } else {
        console.log("- ! - CAGED, Cannot fire");
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
        camera.setFocalLength(120);
        controls.dampingFactor = 0.01;

    } else {
        camera.setFocalLength(17.15234644359233);
        controls.dampingFactor = 0.05;
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

            document.getElementById("notifsbg").remove();

            break;

            // fire weapon
        case "c":
            if (!startSim) {
                return
            };
            fire();
            break;

            // reload weapon
        case "r":
            if (!startSim) {
                return
            };

            shotout = false;
            fired = false;
            shotend = false;
            currspeed = 0;

            missileTrackLine.length = 0;
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