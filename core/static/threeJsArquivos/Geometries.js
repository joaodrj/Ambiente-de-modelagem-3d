
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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
//const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)


const geometry = new THREE.BufferGeometry()

const count = 50
const positionsArray = new Float32Array(count * 3 * 3)

for(let i = 0; i < count * 3 * 3; i++ )
{
    positionsArray[i] = (Math.random() - 0.5) * 4
}

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
geometry.setAttribute('position', positionsAttribute)

const material = new THREE.MeshBasicMaterial({
    color: 'green',
    wireframe: true
} )
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//Sizes (tamanhos)
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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