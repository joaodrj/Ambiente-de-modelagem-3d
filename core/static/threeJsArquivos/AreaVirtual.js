import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';


let camera, scene, renderer, controls;
let plane;
let pointer, raycaster, isShiftDown = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

const objects = [];

init();
render();

function init() {
    camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(20,50, 100);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const rollOverGeo = new THREE.BoxGeometry(5, 5, 5);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    cubeGeo = new THREE.BoxGeometry(5, 5, 5);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 'blue' });

    const gridHelper = new THREE.GridHelper(150, 30);
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const geometry = new THREE.PlaneGeometry(200, 200);
    geometry.rotateX(-Math.PI / 2);

    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

let timeout;
function onPointerMove(event) {
    if (!timeout) {
        timeout = setTimeout(function() {
            pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(objects, false);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
                rollOverMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
                render();
            }
            timeout = null;
        }, 100); // Ajuste o intervalo conforme necessário
    }
}




function onPointerDown(event) {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0 && event.button === 0) { // Verifica se o botão esquerdo foi pressionado
        const intersect = intersects[0];

        // delete cube
        if (isShiftDown && intersect.object !== plane) {
            scene.remove(intersect.object);
            objects.splice(objects.indexOf(intersect.object), 1);
        }
        // create cube
        else {
            const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
            scene.add(voxel);
            objects.push(voxel);
        }
        render();
    }
}


function exportSTL() {
    const exporter = new STLExporter();
    const toExport = new THREE.Group();

    scene.traverse(function (child) {
        if (child instanceof THREE.Mesh && child.material === cubeMaterial) {
            toExport.add(child.clone());
        }
    });

    // Aplicar transformações
    toExport.rotateX(Math.PI / 2); 
    toExport.rotateZ(Math.PI); // Rotacionar 180 graus no eixo Z

    toExport.updateMatrixWorld(true);  // Atualiza a matriz do mundo com as transformações correntes

    const result = exporter.parse(toExport, { binary: true });
    saveArrayBuffer(result, 'model.stl');
}



function saveArrayBuffer(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    save(blob, filename);
}

function save(blob, filename) {
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    document.body.removeChild(link);
}

function clearPlane() {
    // Itere sobre todos os objetos na cena
    objects.slice().forEach(object => {
        if (object instanceof THREE.Mesh && object !== plane) {
            // Remove o objeto da cena
            scene.remove(object);
            // Remove o objeto do array de objetos para manter a sincronia
            objects.splice(objects.indexOf(object), 1);
        }
    });
    // renderiza a cena novamente
    render();
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = true; break;
        case 69: exportSTL(); break;  // 'E' para baixar o arquivo stl
        case 67: clearPlane(); break; // 'C' para limpar o plano
    }
}

function onDocumentKeyUp(event) {
    if (event.keyCode === 16) {
        isShiftDown = false;
    }
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}