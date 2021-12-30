let stats, scene, camera, renderer
let gui, orbitControls, dragControls, transformControls
/**使用射线投影获得点击的形状，再对形状进行处理*/
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let operateType = "", operateGeo = "";
let objects = [], curObj, curParameters, curGeoType
let geoSetMoreWrapper = null, differInputDom = null
let crash = false;

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
    initLight()

    addMouseEvents();
    addOperateEvents();
    
    // 添加坐标系
    var axes = new THREE.AxisHelper(1000);//参数设置了三条轴线的长度
    scene.add(axes);

    stats = initStats();
    
    
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
// 初始化工作
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
        transformControls.detach();
    })

    dragControls.addEventListener('drag', function( event ){ //选中模型
        // 变换控件对象与选中的对戏那个object绑定
        transformControls.attach(event.object);
        // 设置三维坐标轴的大小，这个坐标轴不会随着模型的缩放而缩放
        transformControls.setSize(0.4);
    });
}
//创建光源
function initLight(){
    // 方向光
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.shadow.camera.near = 20; //产生阴影的最近距离
    directionalLight.shadow.camera.far = 200; //产生阴影的最远距离
    directionalLight.shadow.camera.left = -50; //产生阴影距离位置的最左边位置
    directionalLight.shadow.camera.right = 50; //最右边
    directionalLight.shadow.camera.top = 50; //最上边
    directionalLight.shadow.camera.bottom = -50; //最下面
    //这两个值决定使用多少像素生成阴影 默认512
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.mapSize.width = 1024;
    scene.add( directionalLight );
    // 环境光
    scene.add( new THREE.AmbientLight( 0x505050 ) );
   }
// 事件监听
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
        // 每个GUI 都是重建的
        if (gui != undefined) {
            gui.destroy()
            gui = undefined
        }
        setCurObjGUI();
     } else {
        if (gui != undefined) {
            gui.destroy()
            gui = undefined
        }
        if (geoSetMoreWrapper != null) {
            geoSetMoreWrapper.style.display = 'none';
        }
     }
}
function onKeyUp (event) {
    switch(event.keyCode) {
        case 46: // delete
            deleteObject();
            break;
        case 83: // S
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
// 碰撞监测
function collision(collisionArray, Movingcube){
    if (Movingcube == undefined) {
        return null
    }

    //获取到底部cube的中心点坐标
    var originPoint = Movingcube.position.clone();

    for(var vertexIndex = 0; vertexIndex < Movingcube.geometry.vertices.length; vertexIndex++){
        //顶点原始坐标
        var localVertex = Movingcube.geometry.vertices[vertexIndex].clone();
        //顶点经过变换后的坐标
        var globaVertex = localVertex.applyMatrix4(Movingcube.matrix);
        //获得由中心指向顶点的向量
        var directionVector = globaVertex.sub(Movingcube.position);

        //将方向向量初始化
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        //检测射线与多个物体相交的情况
        var collisionResults = ray.intersectObjects(collisionArray, true);

        // //如果返回结果不为空，且交点与射线起点的距离小于物体中心至顶点的距离，则发生碰撞
        if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() + 1.2 ){
            crash = true;
            console.log('!!!-----------发生碰撞');
        }
    }
}
// 更新几何体信息
function setCurObjGUI () {
    gui = new dat.GUI();
    
    curParameters = {
		positionX: curObj.position.x,
		positionY: curObj.position.y,
		positionZ: curObj.position.z,
        rotationX: curObj.rotation.x,
		rotationY: curObj.rotation.y,
		rotationZ: curObj.rotation.z,
        scaleX: curObj.scale.x,
		scaleY: curObj.scale.y,
		scaleZ: curObj.scale.z,
		color: window.colorHex(curObj.material.color),
		opacity: curObj.material.opacity, 
		material: window.getTheMaterialType(curObj.material),
	};
    
    var folder1 = gui.addFolder('Position');
	var positionX = folder1.add( curParameters, 'positionX' ).min(-200).max(200).step(1).listen();
	var positionY = folder1.add( curParameters, 'positionY' ).min(-200).max(200).step(1).listen();
	var positionZ = folder1.add( curParameters, 'positionZ' ).min(-200).max(200).step(1).listen();
	folder1.open();

    var folder2 = gui.addFolder('Rotation');
	var rotationX = folder2.add( curParameters, 'rotationX' ).min(0).max(360).step(5).listen();
	var rotationY = folder2.add( curParameters, 'rotationY' ).min(0).max(360).step(5).listen();
	var rotationZ = folder2.add( curParameters, 'rotationZ' ).min(0).max(360).step(5).listen();
	folder2.open();

    var folder3 = gui.addFolder('Scale');
	var scaleX = folder3.add( curParameters, 'scaleX' ).name('scaleX');
	var scaleY = folder3.add( curParameters, 'scaleY' ).name('scaleX');
	var scaleZ = folder3.add( curParameters, 'scaleZ' ).name('scaleX');
	folder3.open();
	
	positionX.onChange(function(value) {   curObj.position.x = value;   });
	positionY.onChange(function(value) {   curObj.position.y = value;   });
	positionZ.onChange(function(value) {   curObj.position.z = value;   });
    rotationX.onChange(function(value) {   curObj.rotation.x = value;   });
	rotationY.onChange(function(value) {   curObj.rotation.y = value;   });
	rotationZ.onChange(function(value) {   curObj.rotation.z = value;   });
    scaleX.onChange(function(value) {   curObj.scale.x = value;   });
	scaleY.onChange(function(value) {   curObj.scale.y = value;   });
	scaleZ.onChange(function(value) {   curObj.scale.z = value;   });
	
	var curColor = gui.addColor( curParameters, 'color' ).name('Color').listen();
	curColor.onChange(function(value)  {   curObj.material.color.setHex( value.replace("#", "0x") );   });
	
	var curOpacity = gui.add( curParameters, 'opacity' ).min(0).max(1).step(0.01).name('Opacity').listen();
	curOpacity.onChange(function(value) {   curObj.material.opacity = value;   });
	
	var curMaterial = gui.add( curParameters, 'material', [ "Basic", "Lambert", "Phong", "Wireframe" ] ).name('Material Type').listen();
	curMaterial.onChange(function(value)  {   updateCube();   });
	
	gui.open();
}
function updateCube(){
	var value = curParameters.material;
	var newMaterial;

	if (value == "Basic")
		newMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	else if (value == "Lambert")
		newMaterial = new THREE.MeshLambertMaterial( { color: 0x000000 } );
	else if (value == "Phong")
		newMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
	else // (value == "Wireframe")
		newMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
    curObj.material = newMaterial;

    curObj.position.x = curParameters.positionX;
    curObj.position.y = curParameters.positionY;
    curObj.position.z = curParameters.positionZ;
    curObj.material.color.setHex( curParameters.color.replace("#", "0x") );
    curObj.material.opacity = curParameters.opacity;  
    curObj.material.transparent = true;
	curObj.visible = true;
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
// 添加mesh
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

    document.getElementById('modelFiles').addEventListener('change', function(event) {
        let files = event.target.files;
        for(let i = 0; i < files.length; i++) {
           let file = files[i];
           let lastDotIndex = file.name.lastIndexOf('.')
           let fileName = file.name.substring(0, lastDotIndex)
           let fileType = file.name.substring(lastDotIndex+1)
           
        }
        console.log(event.target.files, '-----------打印event.target.files');
    })

    orbitControls.addEventListener("change", function(){
        collision(objects, curObj,camera, orbitControls );
    }, false);

}


window.onload = init
window.addEventListener("resize", onResize, false)