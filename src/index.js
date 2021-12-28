let stats, scene, camera, renderer
let gui, orbitControls, dragControls, transformControls
/**使用射线投影获得点击的形状，再对形状进行处理*/
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let operateType = "", operateGeo = "";
let objects = [], curObj, curGeoType
let geoSetMoreWrapper = null, differInputDom = null

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    // create a render and set the size
    renderer.setClearColor(new THREE.Color(0xcccccc));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('WebGL-output').appendChild(renderer.domElement);

    camera.position.set(30, 30, 60);
    camera.lookAt(scene.position);

    // 轨道控制器 拖拽控制器
    initOrbitControl();
    initDragTransformControl();

    addMouseEvents();
    addOperateEvents();
    
    // 添加坐标系
    var axes = new THREE.AxisHelper(1000);//参数设置了三条轴线的长度
    scene.add(axes);
    
    stats = initStats();
    gui = new dat.GUI();
    
    
    render()
}
function onResize () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}
function render () {
    stats.update();
    orbitControls.update();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
function initStats () {
    let stats = new Stats();
    stats.setMode(0);

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.bottom = '0px';

    document.getElementById('Stats-output').appendChild(stats.domElement);
    return stats;
}
function initOrbitControl() {
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enabled = true;
    orbitControls.enableDamping = true;
    //是否可以缩放
    orbitControls.enableZoom = true;
    //是否自动旋转
    orbitControls.autoRotate = false;
    //设置相机距离原点的最远距离
    orbitControls.minDistance = 1;
    //设置相机距离原点的最远距离
    orbitControls.maxDistance = 3000;
}
function initDragTransformControl () {
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    //这里是给groupBIM这一个对象数组加入了一个拖拽控制器
    dragControls = new THREE.DragControls( [ ... objects ], camera, renderer.domElement );
    setDragControl();
}
function setDragControl() {
    dragControls.addEventListener('dragstart', (event) => {
        orbitControls.enabled = false;
    });
    //物体拖拽完毕，将轨迹控制器开启
    dragControls.addEventListener('dragend',(event)=>{
        orbitControls.enabled = true;
        transformControls.detach(event.object);
    })

    dragControls.addEventListener('drag', function( event ){ //选中模型
        // 变换控件对象与选中的对戏那个object绑定
        transformControls.attach(event.object);
        // 设置三维坐标轴的大小，这个坐标轴不会随着模型的缩放而缩放
        transformControls.setSize(0.4);
    });
}

function addMouseEvents () {
    document.addEventListener('keydown', onKeyUp, false)
    renderer.domElement.addEventListener('mousedown', onMouseDown, false)
}
function onMouseDown(event){
    event.preventDefault();
    // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
    raycaster.setFromCamera(mouse, camera);

     //将射线投影到屏幕，如果scene.children里的某个或多个形状相交，则返回这些形状
     //第二个参数是设置是否递归，默认是false，也就是不递归。当scene里面添加了Group对象的实例时，就需要设置这个参数为true
     //第一个参数不传scene.children也可以，传一个group.children或一个形状数组都可以（这样可以实现一些特别的效果如点击内部的效果）
     //另外，因为返回的是一个数组，所以遍历数组就可以获得所有相交的对象，当元素重叠时，特别有用
     var intersects = raycaster.intersectObjects(objects, true);  
     if(intersects.length>0){
        // 获取面上的对象
        curObj = intersects[0].object;
        console.log(curObj, '-----------打印curObj');
     } else {
         if (geoSetMoreWrapper != null) {
            geoSetMoreWrapper.style.display = 'none';
         }
     }
}
function onKeyUp (event) {
    switch(event.keyCode) {
        case 46:
            deleteObject();
            break;
        case 83: // S
            showObjSetDiv();
            break;
        case 84: // T
            transformControls.setMode('translate')
            break;
        case 82: // R
            transformControls.setMode('rotate')
            break;
        case 83: // S
            transformControls.setMode('scale')
            break;
    }
}

function showObjSetDiv() {
    geoSetMoreWrapper = document.getElementById('geoSetMoreWrapper')
    differInputDom = document.getElementById('differInput')
    curGeoType = curObj.geometry.type

    let innerHtml = "<h4>详细设置</h4>"
    switch(curGeoType) {
        case "PlaneGeometry":
            innerHtml += "X轴上的宽度：<input type='text' name='width' value='' style='display: inline; width:20px;'/><br />"
            innerHtml += "Y轴上的高度：<input type='text' name='height' value='' style='display: inline; width:20px;'/><br />"
            innerHtml += "Z轴上的深度：<input type='text' name='depth' value='' style='display: inline; width:20px;'/>"
            break;
        case "SphereGeometry":
            innerHtml += "半径：<input type='text' name='radius' value='' style='display: inline; width:20px;'/>"
            break;
        case "CylinderGeometry":
            innerHtml += "顶部半径：<input type='text' name='radiusTop' value='' style='display: inline; width:20px;'/><br />"
            innerHtml += "底部半径：<input type='text' name='radiusBottom' value='' style='display: inline; width:20px;'/><br />"
            innerHtml += "圆柱高度：<input type='text' name='height' value='' style='display: inline; width:20px;'/>"
            break;
        case "ConeGeometry":
            innerHtml += "底部半径：<input type='text' name='radius' value='' style='display: inline; width:20px;'/><br />"
            innerHtml += "圆锥高度：<input type='text' name='height' value='' style='display: inline; width:20px;'/>"
            break;
        case "TetrahedronGeometry":
            innerHtml += "半径：<input type='text' name='radius' value='' style='display: inline; width:20px;'/>"
            break;
        case "PlaneGeometry":
            innerHtml += "X轴上的宽度：<input type='text' name='width' value='' style='display: inline; width:20px;'/><br />"
            innerHtml += "Y轴上的高度：<input type='text' name='height' value='' style='display: inline; width:20px;'/>"
            break;
    }
    // differInputDom.innerHTML = innerHtml
    geoSetMoreWrapper.style.display = 'block';
}
function clearInput () {
    let inputDoms = document.getElementsByTagName('input')
    for(let i = 0; i < inputDoms.length; i++) {
       inputDoms[i].value = '';
    }
}
function setCurObjMore () {
    let inputDoms = document.getElementsByTagName('input')
    let obj = curObj

    for(let i = 0; i < inputDoms.length; i++) {
       let val = inputDoms[i].value.trim()
       if (val.length > 0) {
            switch(inputDoms[i].name) {
                case "positionX": obj.position.x = val; break;
                case "positionY": obj.position.y = val; break;
                case "positionZ": obj.position.z = val; break;
                case "rotateX": obj.rotation.x = val; break;
                case "rotateY": obj.rotation.y = val; break;
                case "rotateZ": obj.rotation.z = val; break;
                case "scaleX": obj.scale.x = val; break;
                case "scaleY": obj.scale.y = val; break;
                case "scaleZ": obj.scale.z = val; break;
                case "opacity": 
                    obj.material.transparent = true;
                    obj.material.opacity = val;
                    break;
                case "color": 
                    let colorVal = "0x" +val.split('#')[1];
                    obj.material.color = new THREE.Color(colorVal);
                    break;
                case "width": obj.geometry.parameters.width = val; break;
                case "height": obj.geometry.parameters.height = val; break;
                case "depth": obj.geometry.parameters.depth = val; break;
                case "radius": obj.geometry.parameters.radius = val; break;
                case "radiusTop": obj.geometry.parameters.radiusTop = val; break;
                case "radiusBottom": obj.geometry.parameters.radiusBottom = val; break;
            }
       }
    }
}

function deleteObject () {
    const draggableObjects = dragControls.getObjects();
    if (draggableObjects.length > 0) {
        let obj = curObj;
        scene.remove(obj);
        
        for(let i = objects.length - 1; i >= 0; i--) {
           let item = objects[i];
           if (item.uuid == obj.userDate) {
               objects.splice(i, 1)
           }
        }
        for(let i = draggableObjects.length - 1; i >= 0 ; i--) {
           let item = draggableObjects[i];
           if (item.uuid == obj.userDate) {
                draggableObjects.splice(i, 1)
            }
        }
    }
}

function addBox() {
    var geometry = new THREE.BoxGeometry( 2, 2, 2 );
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var box = new THREE.Mesh( geometry, material );
    box.position.set(0,0,1)
    // 存储uuid
    box.userData = box.uuid

    objects.push(box)
    scene.add( box )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(box)
}
function addSphere() {
    var geometry = new THREE.SphereGeometry( 2, 30, 30 );
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(0,0,1)
    sphere.userData = sphere.uuid

    objects.push(sphere)
    scene.add( sphere )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(sphere)
}
function addCylinder() {
    var geometry = new THREE.CylinderGeometry( 2, 2, 2, 30);
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(0,0,1)
    cylinder.userData = cylinder.uuid

    objects.push(cylinder)
    scene.add( cylinder )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(cylinder)
}
function addCone() {
    var geometry = new THREE.ConeGeometry( 2, 2, 30 );
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var cone = new THREE.Mesh( geometry, material );
    cone.position.set(0,0,1)
    cone.userData = cone.uuid

    objects.push(cone)
    scene.add( cone )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(cone)
}
function addTetrahedron() {
    var geometry = new THREE.TetrahedronGeometry( 2 );
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var tetrahedron = new THREE.Mesh( geometry, material );
    tetrahedron.position.set(0,0,1)
    tetrahedron.userData = tetrahedron.uuid

    objects.push(tetrahedron)
    scene.add( tetrahedron )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(tetrahedron)
}
function addPlane() {
    var geometry = new THREE.PlaneGeometry( 30, 30 );
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var plane = new THREE.Mesh( geometry, material );
    plane.position.set(0,0,1)
    plane.rotation.set(-0.5 * Math.PI, 0, 0)
    plane.userData = plane.uuid

    objects.push(plane)
    scene.add( plane )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(plane)
}

function addOperateEvents () {
    document.getElementById('addPlane').addEventListener('click', function () {
        addPlane()
    })
    document.getElementById('addBox').addEventListener('click', function () {
        addBox()
    })
    document.getElementById('addSphere').addEventListener('click', function () {
        addSphere()
    })
    document.getElementById('addCone').addEventListener('click', function () {
        addCone()
    })
    document.getElementById('addCylinder').addEventListener('click', function () {
        addCylinder()
    })
    document.getElementById('addTetrahedron').addEventListener('click', function () {
        addTetrahedron()
    })
    document.getElementById('okBtn').addEventListener('click', function () {
        setCurObjMore()
    })
    document.getElementById('clearBtn').addEventListener('click', function () {
        clearInput()
    })
}


window.onload = init
window.addEventListener("resize", onResize, false)