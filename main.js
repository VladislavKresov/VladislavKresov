import './style.css'

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointLightHelper } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'),
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(-2, 5, 15);

const wallFront = new THREE.Mesh( new THREE.PlaneGeometry( 60, 40 ), new THREE.MeshStandardMaterial( {color: 0xb0a18d} ) );
wallFront.position.set(-20, 20, 0);
scene.add( wallFront );

const wallRight = new THREE.Mesh( new THREE.PlaneGeometry( 60, 40 ), new THREE.MeshStandardMaterial( {color: 0xb0a18d} ) );
wallRight.position.set(10, 20, 30);
wallRight.rotation.y = -Math.PI / 2;
scene.add( wallRight );

const floor = new THREE.Mesh( new THREE.PlaneGeometry( 60, 60 ), new THREE.MeshStandardMaterial( {color: 0x5a5a5a} ) );
floor.position.set(-20, 0, 30);
floor.rotation.x = -Math.PI / 2;
scene.add( floor );

const fbxLoader = new FBXLoader()
fbxLoader.load(
    'geometry/table.fbx',
    (object) => {
        object.scale.set(.01, .01, .01)
        object.position.set(0, 5, 5)
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(-1, 6, 7);
scene.add(pointLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);
const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  controls.update();
}

animate();