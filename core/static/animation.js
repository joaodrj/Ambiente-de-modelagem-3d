
import * as THREE from 'three'


console.log(gsap)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width/ sizes.height)
camera.position.z = 3
scene.add(camera)

//Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

//Clock
// const clock = new THREE.Clock()

gsap.to(mesh.position, {duration: 1, delay: 1, x: 2})
gsap.to(mesh.position, {duration: 1, delay: 2, x: 0})
//Animations
const tick = () =>
{
    //const elapsedTime = clock.getElapsedTime()
    

    //Update objects
    //camera.position.y = Math.sin(elapsedTime) 
    //camera.position.x = Math.cos(elapsedTime)
    //camera.lookAt(mesh.position)
    //Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()