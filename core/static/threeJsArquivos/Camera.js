
import * as THREE from 'three'


//Cursor
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
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: '#ff0000'} )
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//Sizes (tamanhos)
const sizes = {
    width: 800,
    height: 600
}

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/ sizes.height, 0.1, 100)
//const aspectRatio = sizes.width / sizes.height
//const camera = new THREE.OrthographicCamera(
//    -1 * aspectRatio,
//    1 * aspectRatio,
//    1,
//    -1,
//    0.1,
//    100
// )
//camera.position.x = 2
//camera.position.y = 2
camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)

//Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

//Clock
const clock = new THREE.Clock()

//gsap.to(mesh.position, {duration: 1, delay: 1, x: 2})
//gsap.to(mesh.position, {duration: 1, delay: 2, x: 0})
//Animations
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    //Update camera
    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    camera.position.y = cursor.y * 5
    camera.lookAt(mesh.position)
    //Update objects
    //mesh.rotation.y = elapsedTime
    //Update objects
    //camera.position.y = Math.sin(elapsedTime) 
    //camera.position.x = Math.cos(elapsedTime)
    //camera.lookAt(mesh.position)
    //Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()