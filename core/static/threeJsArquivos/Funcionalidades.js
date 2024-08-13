import * as THREE from 'three';

// Variáveis para controle de wireframe
let wireframeMode = false;

// Função para alternar entre o modo wireframe e o modo sólido
function toggleWireframe(objects, render) {
    wireframeMode = !wireframeMode;
    
    objects.forEach(object => {
        if (object instanceof THREE.Mesh) {
            object.material.wireframe = wireframeMode;
        }
    });
    
    render(); // Renderiza a cena após a alteração
}
export { toggleWireframe };
