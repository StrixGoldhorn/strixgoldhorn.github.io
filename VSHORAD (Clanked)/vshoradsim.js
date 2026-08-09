/*
v2.0.4a OOP Refactor - Split Files
*/
import * as THREE from "./modules/three.module.js";
import * as dat from "./modules/datgui/dat.gui.module.js";
import { OrbitControls } from "./modules/OrbitControls.js";

import { Environment } from "./classes/environment.js";
import { Aircraft } from "./classes/aircraft.js";
import { Launcher } from "./classes/launcher.js";
import { Missile } from "./classes/missile.js";

class VSHORADSimulator {
    constructor() {
        this.startSim = false;
        this.rightClicked = false;
        this.isMobile = this.checkMobile();
        
        this.initThree();
        this.initGUI();
        
        this.uiElements = {
            loadIndicate: document.getElementById("loadIndicate"),
            tempCross: document.getElementById("tempCross"),
            alertDoc: document.getElementById("alert")
        };

        this.environment = new Environment(this.scene, this.isMobile);
        this.launcher = new Launcher(this.scene, this.camera, this.controls, this.worldSettings);
        this.aircraft = new Aircraft(this.scene, this.worldSettings, this.uiElements);
        this.missile = new Missile(this.scene, this.worldSettings, this.camera, this.controls, this.aircraft, this.launcher, this.uiElements, this.clock);

        this.initLights();
        this.bindEvents();
        
        this.renderer.render(this.scene, this.camera);
        this.animateLoop();
    }
    
    checkMobile() {
        const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return regex.test(navigator.userAgent);
    }

    initThree() {
        this.scene = new THREE.Scene();
        document.getElementById("threeCanvas").scene = this.scene;
        
        this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 8000);
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas: document.getElementById("threeCanvas")
        });
        this.clock = new THREE.Clock();

        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 2, 0);
        this.scene.add(this.camera);
        
        this.setControls();
    }

    setControls() {
        this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', () => {
            this.renderer.render(this.scene, this.camera);
        });

        this.controls.target.set(0.5, 2.6, 0);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.maxPolarAngle = 10 * (Math.PI / 12);
        this.controls.minPolarAngle = 5 * (Math.PI / 12);
    }

    initGUI() {
        const gui = new dat.GUI();
        this.worldSettings = {
            scene: { randomise: () => this.environment.generatePlane() },
            c130: { pathx: Math.random() * 1000+500, pathy: Math.random() * 1000+500, zamp: Math.random() * 500, zperiod: Math.random(), gndspeed: 0.0001, agl: Math.random() * 300+100, c130trackline: true, tracklineAutoLength: false },
            missile: { proxFuse: 1.25, "accel factor": 350 },
            operator: { showStats: false, zoomed: { focalLength: 160, dampingFactor: 0.01 }, normal: { focalLength: 20, dampingFactor: 0.05 } }
        };
        
        const sceneFolder = gui.addFolder("scene");
        sceneFolder.add(this.worldSettings.scene,"randomise");
        const c130Folder = gui.addFolder("c130");
        c130Folder.add(this.worldSettings.c130, "pathx", 100, 5000, 50);
        c130Folder.add(this.worldSettings.c130, "pathy", 100, 5000, 50);
        c130Folder.add(this.worldSettings.c130, "zamp", 0, 1000, 1);
        c130Folder.add(this.worldSettings.c130, "zperiod", 0, 10, 0.01);
        c130Folder.add(this.worldSettings.c130, "gndspeed", 0.0001, 0.005);
        c130Folder.add(this.worldSettings.c130, "agl", 0, 500, 10);
        c130Folder.add(this.worldSettings.c130, "c130trackline");
        c130Folder.add(this.worldSettings.c130, "tracklineAutoLength");
        const missileFolder = gui.addFolder("missile");
        missileFolder.add(this.worldSettings.missile, "proxFuse", 1.25, 5);
        missileFolder.add(this.worldSettings.missile, "accel factor", 0, 500, 50);
        const operatorFolder = gui.addFolder("operator");
        operatorFolder.add(this.worldSettings.operator, "showStats");
        const zoomedFolder = operatorFolder.addFolder("zoomed");
        zoomedFolder.add(this.worldSettings.operator.zoomed, "focalLength", 50, 500);
        zoomedFolder.add(this.worldSettings.operator.zoomed, "dampingFactor", 0.001, 0.1);
        const normalFolder = operatorFolder.addFolder("normal");
        normalFolder.add(this.worldSettings.operator.normal, "focalLength", 0, 50);
        normalFolder.add(this.worldSettings.operator.normal, "dampingFactor", 0.01, 0.1);
    }

    initLights() {
        this.missileLight = new THREE.PointLight(0xcca412, 6, 1, 1);
        const sphereSize = 1;
        const pointLightHelper = new THREE.PointLightHelper(this.missileLight, sphereSize);
        this.scene.add(pointLightHelper);
        this.scene.add(this.missileLight);
        this.missileLight.position.set(0, -50, 0);

        this.directionalLight = new THREE.DirectionalLight(0xfff8e3, 3);
        this.directionalLight.position.set(200, 1000, 500);
        this.scene.add(this.directionalLight);

        const pointLight = new THREE.PointLight(0xfff8e3, 2);
        pointLight.position.set(0, 1500, 0);
        this.scene.add(pointLight);
    }

    bindEvents() {
        document.addEventListener("contextmenu", () => {
            if (!this.startSim || this.aircraft.hit) return;
            this.rightClicked = !this.rightClicked;

            if (this.rightClicked) {
                this.camera.setFocalLength(this.worldSettings.operator.zoomed.focalLength);
                this.controls.dampingFactor = this.worldSettings.operator.zoomed.dampingFactor;
            } else {
                this.camera.setFocalLength(this.worldSettings.operator.normal.focalLength);
                this.controls.dampingFactor = this.worldSettings.operator.normal.dampingFactor;
            }
            this.camera.updateProjectionMatrix();
        });

        document.addEventListener("keypress", (e) => {
            switch (e.key) {
                case " ":
                    this.startActions();
                    break;
                case "c":
                    this.fireActions();
                    break;
                case "r":
                    this.reloadActions();
                    break;
            }
        });

        document.addEventListener("keydown", (e) => {
            if (!this.startSim) return;
            if (e.key === "Shift") {
                this.launcher.setCaged(false);
            }
            if (e.key === "C") {
                if (this.missile.shotout || this.missile.fired) {
                    console.log("- ! - No munition");
                }
                this.fireActions();
            }
        });

        document.addEventListener("keyup", (e) => {
            if (!this.startSim) return;
            if (e.key === "Shift") {
                this.launcher.setCaged(true);
                if (this.missile.shotout) {
                    this.missile.shotend = true;
                }
            }
        });

        window.addEventListener('resize', (e) => {
            setTimeout(() => this.winresize(), 500);
        });

        // Mobile controls
        const mobileCage = document.getElementById("mobileCage");
        if (mobileCage) {
            mobileCage.ontouchstart = () => {
                if (this.startSim) this.launcher.setCaged(false);
            };
            mobileCage.ontouchend = () => {
                if (this.startSim) this.launcher.setCaged(true);
            };
        }

        const mobileFire = document.getElementById("mobileFire");
        if (mobileFire) mobileFire.ontouchstart = () => this.fireActions();
        
        const mobileReload = document.getElementById("mobileReload");
        if (mobileReload) mobileReload.ontouchstart = () => this.reloadActions();
        
        const mobileStart = document.getElementById("mobileStart");
        if (mobileStart) {
            mobileStart.ontouchstart = () => {
                mobileStart.style.display = 'none';
                this.startActions();
            };
        }

        setInterval(() => this.flashAlert(), 800);
    }

    animateLoop() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animateLoop());
        if (this.controls) this.controls.update();
    }

    startActions() {
        if (this.missile.fired === false) {
            console.log("- - - START - - -");
            this.startSim = true;
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.rotateSpeed = 0.2;

            this.launcher.rotate();
            this.launcher.setCaged(true);

            this.uiElements.loadIndicate.style.background = "#22cc55";
            this.uiElements.loadIndicate.innerText = "Loaded";
            this.uiElements.loadIndicate.style.color = "white";

            this.uiElements.tempCross.innerHTML = "------ <br />| + | <br />------";
            
            this.uiElements.alertDoc.innerText = "";
            this.uiElements.alertDoc.style.opacity = "0";

            const notifsbg = document.getElementById("notifsbg");
            if (notifsbg) notifsbg.remove();

            if (this.launcher.weaponMesh) {
                this.directionalLight.target = this.launcher.weaponMesh.children[0];
            }
        }
    }

    fireActions() {
        if (!this.startSim) return;
        this.uiElements.alertDoc.innerText = "";
        this.uiElements.alertDoc.style.opacity = "0";
        this.missile.fire();
    }

    reloadActions() {
        if (!this.startSim) return;
        this.missile.reset();
        if (this.aircraft.hit) {
            this.aircraft.reset();
        }
        this.camera.position.set(0, 2, -2);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.maxPolarAngle = 10 * (Math.PI / 12);
        this.controls.minPolarAngle = 5 * (Math.PI / 12);
        this.controls.target.set(0.5, 2.6, 0);
        this.controls.update();
    }

    winresize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    flashAlert() {
        const alertDoc = this.uiElements.alertDoc;
        if (!alertDoc) return;
        if (alertDoc.style.background === 'rgb(34, 204, 85)') {
            alertDoc.style.background = '#dd2222';
        } else {
            alertDoc.style.background = '#22cc55';
        }
    }
}

// Initialize the simulator when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new VSHORADSimulator();
});

// FPS display (stats.js)
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()