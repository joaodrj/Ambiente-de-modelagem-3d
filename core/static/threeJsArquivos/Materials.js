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

//TEXTURAS  
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load('../static/img/texturas/color.jpg')
const doorAlphaTexture = textureLoader.load('../static/img/texturas/alpha.jpg')
const doorAmbienteOcclusionTexture = textureLoader.load('../static/img/texturas/ambientOcclusion.jpg')
const doorHeigtTexture = textureLoader.load('../static/img/texturas/height.jpg')
const doorNormalTexture = textureLoader.load('../static/img/texturas/normal.jpg')
const doorMetalnessTexture = textureLoader.load('../static/img/texturas/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('../static/img/texturas/roughness.jpg')
const matcapTexture = textureLoader.load('../static/img/matcaps/2.png')
const gradientTexture = textureLoader.load('../static/img/gradients/5.jpg')
gradientTexture.minFilter = THREE.NearestFilter
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.generateMipmaps = false

//OBJETOS com MeshBasicMaterial()
//const material = new THREE.MeshBasicMaterial()
//material.map = doorColorTexture
//material.color = new THREE.Color('red')
//material.color.set('blue')
//material.wireframe =true
//material.opacity = 0.5
//material.transparent = true
//material.alphaMap = doorAlphaTexture
//material.side = THREE.DoubleSide

//OBJETOS COM NORMAMATERIAL, cores artisticas
//const material = new THREE.MeshNormalMaterial
//material.wireframe = true
//material.flatShading = true

//OBJETOS COM MatcapMaterial (impressão de ilusão de luzes/reflexos mesmo não tendo)
//const material = new THREE.MeshMatcapMaterial()
//material.matcap = matcapTexture

//OBJETOS COM DepthMaterial, deixa mais escuros sem luzes
//const material = new THREE.MeshDepthMaterial()

//OBJETOS COM MeshLamberMateria, reage bem com a luz
//const material = new THREE.MeshLambertMaterial()

//const material = new THREE.MeshPhongMaterial()
//material.shininess = 100
//material.specular = new THREE.Color(0xff0000)

//const material = new THREE.MeshToonMaterial()
//material.gradientMap = gradientTexture

const material = new THREE.MeshStandardMaterial
material.metalness = 0.45
material.roughness = 0.65


const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    material  
)
sphere.position.x = -1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 16, 16),
    material
)
torus.position.x = 1.5
 
scene.add(sphere, plane, torus)

/*  
    LUZES
*/
const ambienteLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambienteLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)


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
camera.lookAt(sphere.position)
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

    //Animação dos objetos
    sphere.rotation.y = 0.1 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    plane.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime
    controls.update()
    //Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()