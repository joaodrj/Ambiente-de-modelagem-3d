import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { toggleWireframe } from './Funcionalidades.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';


let camera, scene, renderer, controls;
let plane;
let pointer, raycaster;
let isDeleteMode = false;
let isPlacingMode = false; // Controle para modo de colocação

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

let formaSelecionada = ''; // Nenhuma forma selecionada por padrão

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
    rollOverMesh.visible = isPlacingMode && formaSelecionada !== ''; // Só mostra o rollOverMesh quando no modo de colocação
}

// Função para selecionar a forma e alternar para o modo de adição
function selectForma(formaTipo) {
    formaSelecionada = formaTipo; // Atualiza a forma selecionada
    isPlacingMode = true; // Ativa o modo de colocação
    isDeleteMode = false; // Garante que estejamos no modo de adição
    updateRollOverMesh(); // Atualiza o rollOverMesh para refletir a forma selecionada
}

// Função para ativar o modo de seleção (sem colocar formas)
function activateSelectionMode() {
    formaSelecionada = ''; // Reseta a forma selecionada
    isPlacingMode = false; // Desativa o modo de colocação
    rollOverMesh.visible = false; // Esconde o rollOverMesh
}

// Função para ativar/desativar o modo de exclusão
function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    isPlacingMode = true; // Quando alternar para o modo de exclusão, também ativamos o modo de colocação
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
//------------------------------------------------FUNÇÃO PARA ALTERNAR ENTRE OS MODOS---------------------------



// Função para alternar entre os modos de colocação e navegação
function toggleMode() {
    isPlacingMode = !isPlacingMode; // Alterna entre modo de navegação e inserção
    isNavigationMode = !isNavigationMode; // Altera o modo de navegação também

    // Atualiza o comportamento do cursor com base no modo atual
    if (isPlacingMode) {
        document.getElementById('toggleModeButton').textContent = 'Navegação';
        rollOverMesh.visible = true; // Exibe o rollOverMesh no modo de inserção
    } else {
        document.getElementById('toggleModeButton').textContent = 'Inserção';
        rollOverMesh.visible = false; // Oculta o rollOverMesh no modo de navegação
    }

    // Se necessário, altere os controles aqui também
    controls.enabled = !isPlacingMode; // Desabilita os controles de navegação no modo de inserção
}





//---------------------------------------------------------------------------------------------------------------

// Variável para rastrear o modo de navegação
let isNavigationMode = false; // Ajuste essa variável conforme necessário em seu código

// Função para adicionar a forma selecionada ao plano
function onPointerDown(event) {
    if (event.target.matches('#clearButton, #exportButton, #wireframeButton, .ui-element-class')) {
        return;
    }

    if (event.button !== 0) return;

    if (!isPlacingMode) return; // Se não estiver no modo de inserção, não faz nada

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        let forma;

        if (isDeleteMode) {
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
        } else if (formaSelecionada) {
            const color = new THREE.Color(selectedColor);
            if (formaSelecionada === 'cubo') {
                cubeGeo = new THREE.BoxGeometry(5, 5, 5);
                cubeMaterial = new THREE.MeshLambertMaterial({ color });
                forma = new THREE.Mesh(cubeGeo, cubeMaterial);
            } else if (formaSelecionada === 'esfera') {
                const esferaGeo = new THREE.SphereGeometry(2.5, 16, 16);
                const esferaMaterial = new THREE.MeshLambertMaterial({ color });
                forma = new THREE.Mesh(esferaGeo, esferaMaterial);
            }
            forma.position.copy(intersect.point).add(intersect.face.normal).divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);

            scene.add(forma);
            objects.push(forma);
        } else {
            // Se uma forma não estiver selecionada, altere a cor de um objeto existente
            intersect.object.material.color.set(selectedColor);
        }

        render();
    }
}


// Função para manipular o input de cor
document.getElementById('colorPicker').addEventListener('input', setSelectedColor);


//-----------------------------CORES DAS FORMAS/OBJETOS-----------------------


let selectedColor = '#ff0000'; // Cor padrão

// Função para capturar a cor selecionada pelo usuário
function setSelectedColor(event) {
    selectedColor = event.target.value; // Atualiza a cor selecionada
}





// Função para verificar se o clique foi em um elemento de UI
function isClickOnUI(event) {
    // Verifica se o clique ocorreu dentro de qualquer elemento de UI
    return event.target.closest('.container-botao') || event.target.closest('.menu-lateral');
}

// Adiciona um listener para o clique na cena 3D
document.querySelector('.webgl').addEventListener('pointerdown', function(event) {
    // Se o clique foi em um elemento da UI, ignora
    if (isClickOnUI(event)) {
        console.log('Clique em UI detectado:', event.target); // Debug
        return;
    }

    // Atualiza o ponteiro e faz a verificação de interseção
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];

        let forma;
        if (isDeleteMode) {
            // Deleta objeto se estiver no modo de exclusão
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
        } else {
            // Adiciona forma selecionada
            if (formaSelecionada === 'cubo') {
                forma = new THREE.Mesh(cubeGeo, cubeMaterial);
            } else if (formaSelecionada === 'esfera') {
                const esferaGeo = new THREE.SphereGeometry(2.5, 16, 16);
                const esferaMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
                forma = new THREE.Mesh(esferaGeo, esferaMaterial);
            }

            // Posiciona a forma no plano
            forma.position.copy(intersect.point).add(intersect.face.normal);
            forma.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);

            scene.add(forma);
            objects.push(forma);
        }
        render();
    }
});




function onDocumentMouseMove(event) {
    event.preventDefault();

    // Calcula as coordenadas do mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Atualiza o raycaster com base nas coordenadas do mouse
    raycaster.setFromCamera(mouse, camera);

    // Calcula as interseções com os objetos na cena
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const intersect = intersects[0];

        // Posiciona o rollOverMesh na face correta
        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        // Ajuste adicional para posicionar corretamente nas laterais
        if (intersect.face.normal.y === 0) {
            rollOverMesh.position.y -= 25; // Se a face não for a superior, ajuste a altura
        }
    }
}



let isWireframeActive = false; // Estado para rastrear o modo wireframe


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
        if (child instanceof THREE.Mesh && child !== plane && child !== rollOverMesh) {
            toExport.add(child.clone());
        }
    });

    toExport.rotateX(Math.PI / 2); 
    //toExport.rotateZ(Math.PI); 

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
        case 'Escape': toggleMode(); break;
    }
}

function onDocumentKeyUp(event) {
    if (event.keyCode === 16) {
        isShiftDown = false;
    }
}


//------------------------------------- Função para carregar um arquivo STL----------------------------------

// Instancia o STLLoader
const loader = new STLLoader();
const sceneObjects = []; // Novo nome para evitar conflitos
let selectedObject = null;
const offset = new THREE.Vector3();
const intersection = new THREE.Vector3();

function loadSTL(files) {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const geometry = loader.parse(event.target.result);
        const material = new THREE.MeshStandardMaterial({ color: 0x696969 });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;

        scene.children.forEach(child => {
            if (child instanceof THREE.Mesh && child !== plane && child !== rollOverMesh) {
                scene.remove(child);
            }
        });

        scene.add(mesh);
        sceneObjects.push(mesh); // Adiciona o mesh ao array de objetos

        render();
    };

    reader.readAsArrayBuffer(file);
}

function calculateIntersection(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        return intersects[0].point;
    }

    return null;
}

function onDragStart(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(sceneObjects);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        const intersectionPoint = calculateIntersection(event);
        if (intersectionPoint) {
            offset.copy(intersectionPoint).sub(selectedObject.position);
        }
    }
}

function onDragMove(event) {
    if (selectedObject) {
        const intersectionPoint = calculateIntersection(event);
        if (intersectionPoint) {
            selectedObject.position.copy(intersectionPoint.sub(offset));
            render();
        }
    }
}

function onDragEnd() {
    selectedObject = null;
}

document.addEventListener('pointerdown', onDragStart);
document.addEventListener('pointermove', onDragMove);
document.addEventListener('pointerup', onDragEnd);

document.getElementById('loadButton').addEventListener('click', function() {
    document.getElementById('stlInput').click();
});







//--------------------------------------------------------------------------------------------------------------





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
    document.getElementById('toggleModeButton').addEventListener('click', toggleMode);

}



// Função para redimensionar a janela
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

// Função para manipular movimento do ponteiro
function onPointerMove(event) {
    // Atualiza o ponteiro
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    // Verifica a interseção com todos os objetos
    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        
        if (isPlacingMode) {
            // Atualiza a posição do rollOverMesh no modo de colocação
            rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
            rollOverMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
            rollOverMesh.visible = true; // Certifica-se de que o rollOverMesh está visível
        } else {
            rollOverMesh.visible = false; // Oculta o rollOverMesh no modo de navegação
        }
        
        render(); // Re-renderiza a cena
    } else {
        rollOverMesh.visible = false; // Oculta o rollOverMesh se não houver interseção
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
window.loadSTL = loadSTL;

init();
render();
