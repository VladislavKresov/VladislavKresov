import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, 0.1, 1000);
let pixelRatio = window.devicePixelRatio;
let AA = true;
if (pixelRatio > 1) {
    AA = false;
}
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#background'),
    antialias: AA,
    powerPreference: "high-performance",
})

const controls = new OrbitControls(camera, renderer.domElement);

const cameraPositionCurves = [
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-8.3124, 7.2668, -8.5381),
        new THREE.Vector3(-8.3124, 7.2668, -10.5381),
        new THREE.Vector3(-0.5914, 3.1524, -0.7245),
    ),
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.5914, 3.1524, -0.7245),
        new THREE.Vector3(0.9153, 3.1524, -0.7245),
        new THREE.Vector3(0.9153, 4.0453, 0.9248),
    ),
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0.9153, 4.0453, 0.9248),
        new THREE.Vector3(0.4, 4.0453, 0.9248),
        new THREE.Vector3(-0.1547, 3.8268, -0.2624),
    ),
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.1547, 3.8268, -0.2624),
        new THREE.Vector3(-0.1547, 3.8268, -0.2624),
        new THREE.Vector3(-8.3124, 7.2668, -8.5381),
    ),
];

let positionCurvesLength = 0;

for (let posCurve = 0; posCurve < cameraPositionCurves.length; posCurve++) {
    const curve = cameraPositionCurves[posCurve];
    positionCurvesLength += curve.getLength();
}

const cameraTargetCurves = [
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(.5, 0, 1),
        new THREE.Vector3(2.2, 0.6, 1.5),
        new THREE.Vector3(3.9, 3, -1.2),
    ),
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(3.9, 3, -1.2),
        new THREE.Vector3(3.8, 2.8, 1.27),
        new THREE.Vector3(3.72, 2.8, 3.74),
    ),
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(3.72, 2.8, 3.74),
        new THREE.Vector3(2, 2, 3.85),
        new THREE.Vector3(-0.28, 2.45, 3.96),
    ),
    new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.28, 2.45, 3.96),
        new THREE.Vector3(0.11, 0, 2.48),
        new THREE.Vector3(.5, 0, 1),
    ),
];

let targetCurvesLength = 0;

for (let posCurve = 0; posCurve < cameraTargetCurves.length; posCurve++) {
    const curve = cameraTargetCurves[posCurve];
    targetCurvesLength += curve.getLength();
}

init();
animate();

function init() {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.width = 128;
    renderer.shadowMap.height = 128;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 1);

    camera.position.set(cameraPositionCurves[0].v0.x, cameraPositionCurves[0].v0.y, cameraPositionCurves[0].v0.z);
    controls.target = cameraTargetCurves[0].v0;
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;

    LoadScene();

    function LoadScene() {

        function meshesLoaded() {
            var loaderScreen = document.getElementById("loader-screen");
            var fadeEffect = setInterval(function () {
                if (!loaderScreen.style.opacity) {
                    loaderScreen.style.opacity = 1;
                }
                if (loaderScreen.style.opacity > 0) {
                    loaderScreen.style.opacity -= 0.1;
                } else {
                    loaderScreen.style.visibility = 'collapse';
                    clearInterval(fadeEffect);
                }
            }, 50);

            window.scrollTo(0, 0);
            document.body.style.overflowY = "visible";
        }

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.127.0/examples/js/libs/draco/gltf/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(
            './geometry/room.gltf',
            function (gltf) {
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                    if (child.isLight) {
                        child.castShadow = true;
                        child.receiveShadow = false;
                        child.shadow.mapSize.width = 1024;
                        child.shadow.mapSize.height = 1024;
                        child.shadow.bias = 0;
                        child.shadow.bias = -0.006;
                    }
                });
                scene.add(gltf.scene);
                requestAnimationFrame(meshesLoaded);
            }, function (progress) {
                if (progress.total != 0) {
                    var percents = Math.round(progress.loaded / progress.total * 100);
                    var header = document.getElementById("progress-text");
                    header.textContent = percents + '%';
                }
            }, function (error) {
                console.error(error);
            });
    }

    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function moveCamera() {
    const scroll = document.body.getBoundingClientRect().top * -1;
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const length = height - window.innerHeight;
    const scrollPercents = scroll / length;
    let currentPositionCurveIndex = 0;
    let currentTargetCurveIndex = 0;
    let positionReminder = scrollPercents * positionCurvesLength;
    let targetReminder = scrollPercents * targetCurvesLength;
    let positionCurvePercents = 0;
    let targetCurvePercents = 0;

    for (let curveIndex = 0; curveIndex < cameraPositionCurves.length; curveIndex++) {
        const curveLength = cameraPositionCurves[curveIndex].getLength();
        if (positionReminder > curveLength) {
            positionReminder -= curveLength;
        }
        else {
            currentPositionCurveIndex = curveIndex;
            positionCurvePercents = positionReminder / curveLength;
            break;
        }
    }

    for (let curveIndex = 0; curveIndex < cameraTargetCurves.length; curveIndex++) {
        const curveLength = cameraTargetCurves[curveIndex].getLength();
        if (targetReminder > curveLength) {
            targetReminder -= curveLength;
        }
        else {
            currentTargetCurveIndex = curveIndex;
            targetCurvePercents = targetReminder / curveLength;
            break;
        }
    }

    const position = cameraPositionCurves[currentPositionCurveIndex].getPoint(positionCurvePercents);
    camera.position.set(position.x, position.y, position.z);
    controls.target = cameraTargetCurves[currentTargetCurveIndex].getPoint(targetCurvePercents);
}

document.body.onscroll = moveCamera;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}