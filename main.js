import './style.css'

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshStandardMaterial, PlaneGeometry, Vector3 } from 'three';
import { Object3D } from 'three';
import { Mesh } from 'three';
import { PerspectiveCamera } from 'three';
import { OrthographicCamera } from 'three';
import { MathUtils } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, 0.1, 1000);
let pixelRatio = window.devicePixelRatio
let AA = true
if (pixelRatio > 1) {
    AA = false
}
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#background'),
    antialias: AA,
    powerPreference: "high-performance",
})

const controls = new OrbitControls(camera, renderer.domElement);

// axes drawing
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

const cameraPositionCurves = [
    new THREE.QuadraticBezierCurve3(
        new Vector3(-8.3124, 7.2668, -8.5381),
        new Vector3(-8.3124, 7.2668, -10.5381),
        new Vector3(-0.5914, 3.1524, -0.7245),
    ),
    new THREE.QuadraticBezierCurve3(
        new Vector3(-0.5914, 3.1524, -0.7245),
        new Vector3(0.9153, 3.1524, -0.7245),
        new Vector3(0.9153, 4.0453, 0.9248),
    ),
    new THREE.QuadraticBezierCurve3(
        new Vector3(0.9153, 4.0453, 0.9248),
        new Vector3(0.4, 4.0453, 0.9248),
        new Vector3(-0.1547, 3.8268, -0.2624),
    ),
    new THREE.QuadraticBezierCurve3(
        new Vector3(-0.1547, 3.8268, -0.2624),
        new Vector3(-0.1547, 3.8268, -0.2624),
        new Vector3(-8.3124, 7.2668, -8.5381),
    ),
];

let positionCurvesLength = 0;

for (let posCurve = 0; posCurve < cameraPositionCurves.length; posCurve++) {
    const curve = cameraPositionCurves[posCurve];
    positionCurvesLength += curve.getLength();

    // camera position path drawing
    // const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(300));
    // const lineMat = new THREE.LineBasicMaterial({color:0x00ff00});
    // const line = new THREE.Line(lineGeo, lineMat);
    // scene.add(line);
}

const cameraTargetCurves = [
    new THREE.QuadraticBezierCurve3(
        new Vector3(.5, 0, 1),
        new Vector3(2.2, 0.6, 1.5),
        new Vector3(3.9, 3, -1.2),
    ),
    new THREE.QuadraticBezierCurve3(
        new Vector3(3.9, 3, -1.2),
        new Vector3(3.8, 2.8, 1.27),
        new Vector3(3.72, 2.8, 3.74),
    ),
    new THREE.QuadraticBezierCurve3(
        new Vector3(3.72, 2.8, 3.74),
        new Vector3(2, 2, 3.85),
        new Vector3(-0.28, 2.45, 3.96),
    ),
    new THREE.QuadraticBezierCurve3(
        new Vector3(-0.28, 2.45, 3.96),
        new Vector3(0.11, 0, 2.48),
        new Vector3(.5, 0, 1),
    ),
];

let targetCurvesLength = 0;

for (let posCurve = 0; posCurve < cameraTargetCurves.length; posCurve++) {
    const curve = cameraTargetCurves[posCurve];
    targetCurvesLength += curve.getLength();

    // camera target Path drawing
    // const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(300));
    // const lineMat = new THREE.LineBasicMaterial({color:0xff0000});
    // const line = new THREE.Line(lineGeo, lineMat);
    // scene.add(line);
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
                    clearInterval(fadeEffect);
                }
            }, 200);

            window.scrollTo(0, 0);
            document.body.style.overflowY = "visible";
        }
        
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('node_modules/three/examples/js/libs/draco/gltf/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(
            'geometry/room.gltf',
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
                var percents = Math.round(progress.loaded / progress.total * 100);

                var header = document.getElementById("progress-text");
                header.textContent = percents + '%';
            }, function (error) {
                console.error(error);
        });

        // loader.load(
        //     'geometry/mywebsite.glb',
        //     function (gltf) {
        //         gltf.scene.traverse(function (child) {
        //             if (child.isMesh) {
        //                 child.castShadow = true;
        //                 child.receiveShadow = true;
        //             }
        //             if (child.isLight) {
        //                 child.castShadow = true;
        //                 child.receiveShadow = false;
        //                 child.shadow.mapSize.width = 1024;
        //                 child.shadow.mapSize.height = 1024;
        //                 child.shadow.bias = 0;
        //                 child.shadow.bias = -0.006;
        //             }
        //         });
        //         scene.add(gltf.scene);
        //         requestAnimationFrame(meshesLoaded);
        //     }, function (progress) {
        //         var percents = Math.round(progress.loaded / progress.total * 100);

        //         var header = document.getElementById("progress-text");
        //         header.textContent = percents + '%';
        //     }, function (error) {
        //         console.error(error);
        //     });
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