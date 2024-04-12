
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/*  
Debug
*/
const gui = new GUI()
window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        if (gui._hidden) {
            gui.show();
        } else {
            gui.hide();
        }
    }
});

//gui.hide()
const parameters = {
    cor: 0xff0000,
    spin: () =>
    {
        gsap.to(mesh.rotation, {duration: 1, y: mesh.rotation.y + 10})
    }
}
  

const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)
   
})

// criando a cena
const scene = new THREE.Scene()

//Cubo vermelho
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)

const material = new THREE.MeshBasicMaterial({ color: parameters.cor })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//Debug
gui
    .add(mesh.position, 'y')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('elevação')


gui
    .add(mesh, 'visible')

gui 
    .add(material, 'wireframe')
    

  
gui
    .addColor(parameters, 'cor')
    .onChange(() =>
    {
        material.color.set(parameters.cor)
    })

gui 
    .add(parameters, 'spin')

//Sizes (tamanhos)
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//REDIMENSIONAMENTO DE TAMANHOS
window.addEventListener('resize', () =>
{
    //Updates Sizes
    sizes.width = window.innerWidth,
    sizes.height =  window.innerHeight

    //Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //Update renderer
    renderer.setSize(sizes.width, sizes.height)

    //Qualidade dos pixels
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/*  //TELA CHEIA
window.addEventListener('dblclick', () => 
{
    if(!document.fullscreenElement)
    {
        canvas.requestFullscreen()
    }
    else 
    {
        document.exitFullscreen()
    }
})
*/
//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/ sizes.height, 0.1, 100)


camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)



//Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

const controls = new OrbitControls(camera, canvas); 
//controls.enabled = false
//torna os movimentos mais realistas
controls.enableDamping = true

renderer.setSize(sizes.width, sizes.height)


//Clock
const clock = new THREE.Clock()


//Animations
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()



    
    controls.update()
    //Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()