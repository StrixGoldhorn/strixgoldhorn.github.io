// Actual libs
import * as THREE from './libs/three.module.js';
import { ImprovedNoise } from './libs/ImprovedNoise.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GUI } from './libs/dat.gui.min.js';


// Classes
import { Terrain } from './libs/Terrain.js';
import { Signal, ThreatXMTR, BGXMTR } from './libs/Signal.js';
import { Player } from './libs/Player.js';
import { SigStrDisplay } from './libs/SigStrDisplay.js';
import { FreqDisplay } from './libs/FreqDisplay.js';

import { TestSigOmnidirPRF } from './libs/TestSigOmnidirPRF.js';





let signals = [];

let worldSettings = {
    timings : {
        fps: 60,
        time: 0
    },

    terrain : {
        terrainEdgeLength: 1000,
        terrainEdgeCnt: 16,
        distMult: 1,
        perlinMult: 0.005,
        heightMult: 1,
        randomise:function(){
            scene.remove(terrain.mesh);
            generateTerrain();
        }
    },

    signals : {
        numSignals: 1,
        minSigFreq: 1,
        maxSigFreq: 10000,
        reset:function(){
            spawnSignals(worldSettings.signals.numSignals);
            player.dbDetectedSignals = [];
        },
    },

    signalNoise : {
        noiseAvg: -95,
        noiseVari: 0
    },
    magicCmds : {
        consoleScene:function(){
            console.log(scene.children);
        },
        toggleDbgCircles:function(){
            scene.children.forEach(element => {
                if(element.name == "MARKING"){
                    element.visible = !element.visible;
                }
            });
        }
    }
}
let fps = 60;
let time = 0;
let scene, camera, renderer, terrain, player, sigStrDisplay, freqDisplay, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
let numBGXMTR = 0, BGXMTRFreqs = [1234, 4321, 5472, 4200, 6969, 1301];
let bandwidth = 10000, bandwidthStart = 1;
let freqSigStrArr = [];

// INIT PHASE
function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 500, 200);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    // Add skybox
    createSkybox();

    // Add lighting
    addLighting();

    // Create and add terrain
    generateTerrain();

    // Create and add the player
    player = new Player([0, terrain.getTerrainHeight(0, 0), 0]);
    scene.add(player.mesh);

    // Create and add displays
    sigStrDisplay = new SigStrDisplay();
    freqDisplay = new FreqDisplay(bandwidth, bandwidthStart);

    // Fill up freqSigStrArr
    for (let i = 0; i < bandwidth; i++) {
        freqSigStrArr[i] = 0
    }

    // Spawn signals at the ground level (on top of the terrain)
    spawnSignals(worldSettings.signals.numSignals);
    spawnBGXMTR(numBGXMTR);

    // Add fan song E
    // const fansongradar = new FanSongE([20,0,10])
    // scene.add(fansongradar.mesh);
    // signals.push(fansongradar);

    //  Add TestSigOmnidirPRF [20,0,10]
    const testradar1 = new TestSigOmnidirPRF(1500, [50, 0, 150]);
    scene.add(testradar1.mesh);
    signals.push(testradar1);
    const testradar2 = new TestSigOmnidirPRF(2500, [250, 20, -150]);
    scene.add(testradar2.mesh);
    signals.push(testradar2);

    // const testradar2 = new TestSigOmnidirPRF(5500, [250,0,-150]);
    // scene.add(testradar2.mesh);
    // signals.push(testradar2);

    // Add event listeners for player movement
    addKeyboardControls();

    // Add gui
    const gui = new GUI()

    const signalFolder = gui.addFolder('BG Signals')
    signalFolder.add(worldSettings.signals, 'numSignals', 0, 10, 1)
    signalFolder.add(worldSettings.signals, 'minSigFreq', 1, 9999, 1)
    signalFolder.add(worldSettings.signals, 'maxSigFreq', 1, 10000, 1)
    signalFolder.add(worldSettings.signals, 'reset')

    const noiseFolder = gui.addFolder('BG Noise')
    noiseFolder.add(worldSettings.signalNoise, 'noiseAvg', -100, -75)
    noiseFolder.add(worldSettings.signalNoise, 'noiseVari', 0, 15, 0.1)

    const terrainFolder = gui.addFolder('Terrain')
    terrainFolder.add(worldSettings.terrain, 'terrainEdgeLength', 0, 10000, 100)
    terrainFolder.add(worldSettings.terrain, 'terrainEdgeCnt', 1, 128)
    terrainFolder.add(worldSettings.terrain, 'distMult', 1, 10)
    terrainFolder.add(worldSettings.terrain, 'perlinMult', 0, 0.005, 0.0001)
    terrainFolder.add(worldSettings.terrain, 'heightMult', 0, 500, 10)
    terrainFolder.add(worldSettings.terrain, 'randomise')

    const magicCmdsFolder = gui.addFolder("Magic Commands")
    magicCmdsFolder.add(worldSettings.magicCmds, 'consoleScene')
    magicCmdsFolder.add(worldSettings.magicCmds, 'toggleDbgCircles')

    // signalFolder.add(worldSettings.signals, 'resetPlayerTable')

    // terrain : {
    //     terrainEdgeLength: 1000,
    //     terrainEdgeCnt: 16,
    //     distMult: 1
    // },

    // const cameraFolder = gui.addFolder('Camera')
    // cameraFolder.add(camera.position, 'z', 0, 20)
    // cameraFolder.open()


    animate();
}

function generateTerrain(){
    terrain = new Terrain(worldSettings.terrain.terrainEdgeLength, worldSettings.terrain.terrainEdgeCnt, worldSettings.terrain.perlinMult, worldSettings.terrain.heightMult);
    scene.add(terrain.mesh);
}

function createSkybox() {
    const skyColor = 0x87ceeb;  // Sky-blue color
    scene.background = new THREE.Color(skyColor);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // above
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // below
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(100, -100, 100);
    directionalLight2.castShadow = true;
    directionalLight2.shadow.mapSize.width = 1024;
    directionalLight2.shadow.mapSize.height = 1024;
    scene.add(directionalLight2);
}

// Function to spawn multiple signal objects at the correct height
function spawnSignals(numSignals) {

    let temp = [];
    signals.forEach(element => {
        if(element.constructor.name != "ThreatXMTR"){
            temp.push(element)
        }
        else{
            scene.remove(element.mesh);
        }
    });
    signals = [...temp]

    for (let i = 0; i < numSignals; i++) {
        // Random x and z positions within the terrain bounds
        const x = (worldSettings.terrain.terrainEdgeLength / 2) - Math.floor(Math.random() * (worldSettings.terrain.terrainEdgeCnt + 1)) * (worldSettings.terrain.terrainEdgeLength) / worldSettings.terrain.terrainEdgeCnt;
        const z = (worldSettings.terrain.terrainEdgeLength / 2) - Math.floor(Math.random() * (worldSettings.terrain.terrainEdgeCnt + 1)) * (worldSettings.terrain.terrainEdgeLength) / worldSettings.terrain.terrainEdgeCnt;

        // Calculate the height (y) at the signal's x, z position based on Perlin noise
        const y = terrain.getTerrainHeight(x, z);

        // Create and add the signal object at the calculated ground level
        const signal = new ThreatXMTR(0xff0000, worldSettings.signals.minSigFreq + Math.round(Math.random() * (worldSettings.signals.maxSigFreq - worldSettings.signals.minSigFreq)), 'AM', [x, y, z]);
        scene.add(signal.mesh);
        signals.push(signal);
    }
}


function spawnBGXMTR(numBGXMTR) {
    for (let i = 0; i < numBGXMTR; i++) {
        // Random x and z positions within the terrain bounds
        // (Math.round(Math.random()) * 2 - 1) randomises positive or negative
        const x = (Math.round(Math.random()) * 2 - 1) * (Math.random() * worldSettings.terrain.terrainEdgeLength);
        const z = (Math.round(Math.random()) * 2 - 1) * (Math.random() * worldSettings.terrain.terrainEdgeLength);

        // Set height to 0
        const y = 0;

        // Create and add the signal object at the calculated ground level
        const bgxmtrObj = new BGXMTR(BGXMTRFreqs, 'AM', [x, y, z]);
        scene.add(bgxmtrObj.mesh);
        signals.push(bgxmtrObj);
    }
}



// SIM PHASE
function animate() {
    // Set FPS
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, Math.round(1000 / fps));

    // console.log("END FRAME")
    // console.log("START FRAME")

    // Update noise for freqSigStrArr
    generateBackgroundNoise();

    // Update each signal
    signals.forEach((signal, index) => {
        signal.updateSignal(time, 1/fps);

        let fssaIdx = signal.frequency - bandwidthStart;
        // Check if signal freq within shown bandwidth
        if (fssaIdx >= 0 && fssaIdx < bandwidth) {
            // Check if above noise average, else just leave it to noise
            if (calculateSignalStrength(index) > worldSettings.signalNoise.noiseAvg) {
                let calcSigStr = calculateSignalStrength(index);
                freqSigStrArr[fssaIdx] = calcSigStr;
                // Check if current is higher than stored, else only display current
                if (freqSigStrArr[fssaIdx] < calcSigStr) {
                    freqSigStrArr[fssaIdx] = calculateSignalStrength(index) + Math.random() * (worldSettings.signalNoise.noiseVari * 2);
                }
            }
        }

        // Do only if object is ThreatXMTR
        if (signal.constructor.name == "ThreatXMTR" || signal.constructor.name == "TestSigOmnidirPRF") {
            // Orient signal id tag
            let a = camera.position.toArray();
            signal.updateSignalLabel(a);
        }
        else {

            signal.material.transparent = true;
        }

        freqDisplay.updateFreqDisp(freqSigStrArr)
    });
    sigStrDisplay.updateSignalStrength(calculateSignalStrength(0));


    playerMovementUpdate(freqSigStrArr);
    player.processor(freqSigStrArr, bandwidthStart, time);
    player.updateDisp(time);

    // Update OrbitControls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);

    time += 1/fps;
    // console.log(time);


    // console.log(document.getElementsByClassName("dispTableMark"))
    // document.getElementsByClassName("dispTableMark").forEach(element => {
    //     element.addEventListener("click", function(elem){console.log("clicked", elem)})
    // });


    var userSelection = document.getElementsByClassName("dispTableMark")

    for (let i = 0; i < userSelection.length; i++) {
        userSelection[i].addEventListener("click", function () {
            console.log("Clicked index: " + i);
        })
    }
}

function generateBackgroundNoise() {
    freqSigStrArr.forEach((strength, index) => {
        freqSigStrArr[index] = (worldSettings.signalNoise.noiseAvg - worldSettings.signalNoise.noiseVari) + Math.random() * (worldSettings.signalNoise.noiseVari * 2);
    });
}

function calculateSignalStrength(index) {
    // Calculate signal strength
    const signal = signals[index];
    const playerPos = player.mesh.position;
    const signalPos = signal.mesh.position;
    const dist = playerPos.distanceTo(signalPos) * worldSettings.terrain.distMult;
    const spreadingLoss = 32 + 20 * Math.log10(signal.frequency) + 20 * Math.log10(dist);

    return signal.txERP - spreadingLoss + player.recvAntennaGain;
}

function playerMovementUpdate() {
    // Update the player movement
    const forward = (moveForward ? -1 : 0) + (moveBackward ? 1 : 0);
    const right = (moveRight ? 1 : 0) + (moveLeft ? -1 : 0);
    const up = (moveUp ? 1 : 0) + (moveDown ? -1 : 0);
    player.setDirection(forward, right, up);
    player.movePlayer(0.016);  // Assuming 60fps, deltaTime = 1/60 ≈ 0.016
}

// Handle keyboard controls
function addKeyboardControls() {
    window.addEventListener('keydown', function (event) {
        switch (event.code) {
            case 'KeyW':
                moveForward = true;
                break;
            case 'KeyA':
                moveLeft = true;
                break;
            case 'KeyS':
                moveBackward = true;
                break;
            case 'KeyD':
                moveRight = true;
                break;
            case 'KeyQ':
                moveUp = true;
                break;
            case 'KeyE':
                moveDown = true;
                break;
        }
    });

    window.addEventListener('keyup', function (event) {
        switch (event.code) {
            case 'KeyW':
                moveForward = false;
                break;
            case 'KeyA':
                moveLeft = false;
                break;
            case 'KeyS':
                moveBackward = false;
                break;
            case 'KeyD':
                moveRight = false;
                break;
            case 'KeyQ':
                moveUp = false;
                break;
            case 'KeyE':
                moveDown = false;
                break;
        }
    });
}

// Initialize the scene
init();







