import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { toggleWireframe } from './Funcionalidades.js';

let camera, scene, renderer, controls;
let plane;
let pointer, raycaster;
let isDeleteMode = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

let formaSelecionada = 'cubo'; // Forma padrão

const objects = [];

// Função para atualizar o rollOverMesh
function updateRollOverMesh() {
    if (formaSelecionada === 'cubo') {
        rollOverMesh.geometry = new THREE.BoxGeometry(5, 5, 5);
        rollOverMesh.material = new THREE.MeshBasicMaterial({ color: isDeleteMode ? 0xff0000 : 0x00ff00, opacity: 0.5, transparent: true });
    } else if (formaSelecionada === 'esfera') {
        rollOverMesh.geometry = new THREE.SphereGeometry(2.5, 16, 16);
        rollOverMesh.material = new THREE.MeshBasicMaterial({ color: isDeleteMode ? 0xff0000 : 0x00ff00, opacity: 0.5, transparent: true });
    }
}


// Função para selecionar a forma e alternar para o modo de adição
function selectForma(formaTipo) {
    formaSelecionada = formaTipo; // Atualiza a forma selecionada
    isDeleteMode = false; // Garante que estejamos no modo de adição
    updateRollOverMesh(); // Atualiza o rollOverMesh para refletir a forma selecionada
}


// Função para ativar/desativar o modo de exclusão
function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    updateRollOverMesh(); // Atualiza a cor do rollOverMesh
}

// Função para limpar o plano
function clearPlane() {
    objects.slice().forEach(object => {
        if (object instanceof THREE.Mesh && object !== plane) {
            scene.remove(object);
            objects.splice(objects.indexOf(object), 1);
        }
    });
    render();
}

// Função para adicionar a forma selecionada ao plano
function onPointerDown(event) {
    // Verifica se o botão esquerdo do mouse foi clicado
    if (event.button !== 0) return; // 0 é o código para o botão esquerdo

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];

        if (isDeleteMode) {
            // Deleta objeto se estiver no modo de exclusão
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
        } else {
            let forma;
            if (formaSelecionada === 'cubo') {
                forma = new THREE.Mesh(cubeGeo, cubeMaterial);
            } else if (formaSelecionada === 'esfera') {
                const esferaGeo = new THREE.SphereGeometry(2.5, 16, 16);
                const esferaMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
                forma = new THREE.Mesh(esferaGeo, esferaMaterial);
            }
            
            forma.position.copy(intersect.point).add(intersect.face.normal);
            forma.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
            scene.add(forma);
            objects.push(forma);
        }
        render();
    }
}

let isWireframeActive = false; // Estado para rastrear o modo wireframe

// Função para alternar o wireframe


// Adiciona o listener ao botão de wireframe
document.getElementById('wireframeButton').addEventListener('click', () => {
    toggleWireframe(objects, render);
});



// Função para exportar STL
function exportSTL() {
    const exporter = new STLExporter();
    const toExport = new THREE.Group();
    

    // Adiciona todos os objetos Mesh na cena ao grupo a ser exportado
    scene.traverse(function (child) {
        if (child instanceof THREE.Mesh && child !== plane) {
            toExport.add(child.clone());
        }
    });

    toExport.rotateX(Math.PI / 2); 
    toExport.rotateZ(Math.PI); 

    toExport.updateMatrixWorld(true); 

    const result = exporter.parse(toExport, { binary: true });
    saveArrayBuffer(result, 'model.stl');
}


// Função para salvar o buffer
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

// Funções para manipular eventos do teclado
function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = true; break;
        case 69: exportSTL(); break;  
        case 67: clearPlane(); break; 
        case 68: toggleDeleteMode(); break; // Alternar modo de exclusão com a tecla 'D'
    }
}

function onDocumentKeyUp(event) {
    if (event.keyCode === 16) {
        isShiftDown = false;
    }
}

// Função de inicialização
function init() {
    camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(20, 50, 100);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Inicializa o rollOverMesh com o cubo como forma padrão
    rollOverMesh = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true }));
    scene.add(rollOverMesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Habilita rotação, zoom e pan
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    
    // Configura os botões do mouse
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,      // Botão esquerdo: apenas arrasta no plano X e Y (pan)
        MIDDLE: THREE.MOUSE.DOLLY,  // Botão do meio: zoom
        RIGHT: THREE.MOUSE.ROTATE   // Botão direito: rotação
    };
    

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

    document.getElementById('clearButton').addEventListener('click', clearPlane);
    document.getElementById('exportButton').addEventListener('click', exportSTL);
}



// Função para redimensionar a janela
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

// Função para manipular movimento do ponteiro
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
        }, 100); 
    }
}

// Função de renderização
function render() {
    controls.update();
    renderer.render(scene, camera);
}

// Torna funções globais
window.selectForma = selectForma;
window.clearPlane = clearPlane;
window.exportSTL = exportSTL;
window.toggleDeleteMode = toggleDeleteMode;

init();
render();
