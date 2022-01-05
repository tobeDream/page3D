let stats, scene, camera, renderer;
let gui, orbitControls, dragControls, transformControls;
/**使用射线投影获得点击的形状，再对形状进行处理*/
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let objects = [], curObj, curParameters;
let collidableMeshList = [];

const ACTION_SELECT = 1, ACTION_NONE = 0;
let curveHandles = [];
let action = ACTION_NONE, flow, line;
let passingPoints = [];

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
    // 灯光 坐标轴  帧状态
    stats = initStats();
    initLight()
    initAxes()
    // 事件监听
    addMouseEvents();
    addOperateEvents();

    render()
}
function delCurveObj () {
    console.log(line, '-----------打印line');
    if (line == undefined) return;
    scene.remove(line);
    scene.remove(flow.object3D);
    line = undefined;
    flow = undefined;
    render()
}
function pathAddPoint (object, moveFlag, updateFlag) {
    if (object == undefined) return;
    for(let i = 0; i < passingPoints.length; i++) {
        let obj = passingPoints[i]
        if (obj.userData == object.userData) {
            if (moveFlag) {
                passingPoints.splice(i, 1, object);
            } else {
                passingPoints.splice(i, 1);
            }
            break;
        }
    }
    if (updateFlag) {
        setTimeout(() => {
            createCurveMove ()
        }, 500)
    } else {
        passingPoints.push(object);
    }
}
function createCurveMove () {
    delCurveObj();
    let initialPoints = [];
    for(let i = 0; i < passingPoints.length; i++) {
        let obj = {}
        obj.x = passingPoints[i].position.x
        obj.y = passingPoints[i].position.y
        obj.z = passingPoints[i].position.z
        initialPoints.push(obj);
    }
    if (initialPoints.length < 2) return;

    curveHandles = [...passingPoints];
    // const boxGeometry = new THREE.BoxGeometry( 2, 2, 2 );
    // const boxMaterial = new THREE.MeshBasicMaterial();
    // for ( const handlePos of initialPoints ) {
    //     handle = new THREE.Mesh( boxGeometry, boxMaterial );
    //     handle.position.copy( handlePos );
    //     curveHandles.push( handle );
    //     scene.add( handle );
    // }
    const curve = new THREE.CatmullRomCurve3(
        curveHandles.map( ( handle ) => handle.position )
    );
    curve.curveType = 'centripetal';
    curve.closed = true;
    const points = curve.getPoints( 50 );
    line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints( points ),
        new THREE.LineBasicMaterial( { color: 0x00ff00 } )
    );
    scene.add( line );
    const geometry = new THREE.SphereGeometry( 1, 30, 30 );
    const material = new THREE.MeshBasicMaterial( {color: 0x99ffff} );
    const objectToCurve = new THREE.Mesh( geometry, material );
    flow = new Flow( objectToCurve );
    flow.updateCurve( 0, curve );
    scene.add( flow.object3D );
}
function aniCurve () {
    if ( flow ) {
        flow.moveAlongCurve( 0.001 );
    }
}
function onResize () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}
function render () {
    stats.update();
    orbitControls.update();
    aniCurve()
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
// 创建坐标轴
function initAxes() {
    // 添加坐标系
    var axes = new THREE.AxisHelper(1000);//参数设置了三条轴线的长度
    scene.add(axes);

    /* var axes = new THREE.AxisHelper(1000);
	axes.position.set(0, 0, 0);
	scene.add(axes);
	
	var gridXZ = new THREE.GridHelper(100, 10, 0x006600, 0x006600);
	gridXZ.position.set( 0,0,0 );
	scene.add(gridXZ);
	
	var gridXY = new THREE.GridHelper(100, 10, 0x000066, 0x000066);
	gridXY.position.set( 0,0,0 );
	gridXY.rotation.x = Math.PI/2;
	scene.add(gridXY);

	var gridYZ = new THREE.GridHelper(100, 10, 0x660000, 0x660000);
	gridYZ.position.set( 0,0,0 );
	gridYZ.rotation.z = Math.PI/2;
	scene.add(gridYZ) */
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
        // 包围盒随着几何体移动
        updateMeshWrap();
        // 设置组件消失
        delGUI()
        // 碰撞检测
        collisionRaycasterDetect()
    });
}
// 事件监听
function addMouseEvents () {
    document.addEventListener('keydown', onKeyDown, false)
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
        setCurObjGUI();
        // 运动轨迹变化
        pathAddPoint(curObj, true, true);
     } else {
        delGUI()
     }
}
function onKeyDown (event) {
    switch(event.keyCode) {
        case 46: // delete
            deleteObject();
            break;
        case 83: // S
            pathAddPoint(curObj, false, false)
            break;
        case 84: // T
            createCurveMove()
            break;
        case 82: // R
            transformControls.setMode('rotate')
            break;
    }
}
// 更新几何体信息
function setCurObjGUI () {
    delGUI()
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
	var positionX = folder1.add( curParameters, 'positionX' ).min(-200).max(100).step(1).listen();
	var positionY = folder1.add( curParameters, 'positionY' ).min(-200).max(100).step(1).listen();
	var positionZ = folder1.add( curParameters, 'positionZ' ).min(-200).max(100).step(1).listen();
	folder1.open();

    var folder2 = gui.addFolder('Rotation');
	var rotationX = folder2.add( curParameters, 'rotationX' ).min(0).max(360).step(5).listen();
	var rotationY = folder2.add( curParameters, 'rotationY' ).min(0).max(360).step(5).listen();
	var rotationZ = folder2.add( curParameters, 'rotationZ' ).min(0).max(360).step(5).listen();
	folder2.open();

    var folder3 = gui.addFolder('Scale');
	var scaleX = folder3.add( curParameters, 'scaleX' ).name('scaleX');
	var scaleY = folder3.add( curParameters, 'scaleY' ).name('scaleY');
	var scaleZ = folder3.add( curParameters, 'scaleZ' ).name('scaleZ');
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
function delGUI () {
    if (gui != undefined) {
        gui.destroy()
        gui = undefined
    }
}
// 包围盒
function updateMeshWrap () {
    if (curObj.boxHelper == undefined) return;
    let boxHelper = curObj.boxHelper
    let boxWrap = curObj.boxWrap
    boxWrap.setFromObject(curObj);
    boxHelper.update();
}
// 屏幕射线碰撞检测
// 射线检测  相交的部分越多 触发次数越多
// 射线监测不够灵敏  几何体完全合并时不能判定
function collisionRaycasterDetect () {
    if (curObj == undefined) return null;
    let MovingCube = curObj.boxHelper;
    var originPoint = MovingCube.position.clone();
	clearText();
    
    let verticesArr = MovingCube.geometry.attributes.position.array;
	for (var vertexIndex = 0; vertexIndex < verticesArr.length; vertexIndex = vertexIndex + 3) {
        // BufferGeometry 的 vertices 需要另外构建		
        let vt = new THREE.Vector3();
        vt.x = verticesArr[vertexIndex];
        vt.y = verticesArr[vertexIndex+1];
        vt.z = verticesArr[vertexIndex+2];

        var localVertex = vt;
        // var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4( MovingCube.matrix );
		var directionVector = globalVertex.sub( MovingCube.position );
		
		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObjects( collidableMeshList );
        if (collisionResults.length == 1 && collisionResults[0].object.userData == MovingCube.userData){
            clearText();
            return;
        }
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )  {
			appendText(" 撞上了！！！ ");
        }
	}	
	orbitControls.update();
	stats.update();
}
function clearText(){   document.getElementById('message').innerHTML = '..........';   }
function appendText(txt){   document.getElementById('message').innerHTML += txt;   }

function addMeshWrap (mesh, color) {
    // 创建他的包围盒的辅助线
    var boxHelper = new THREE.BoxHelper(mesh, color );
    // 创建包围盒
    let boxWrap = new THREE.Box3().setFromObject( mesh );
    boxHelper.userData = mesh.userData
    boxWrap.userData = mesh.userData
    mesh.boxHelper = boxHelper
    mesh.boxWrap = boxWrap
    boxHelper.visible = false
    // boxWrap.opacity = false
    scene.add(boxHelper);

    collidableMeshList.push(mesh)
}
// 添加mesh
function addBox() {
    let color = Math.random()*0xffffff;
    var geometry = new THREE.BoxGeometry( 2, 2, 2 );
    var material = new THREE.MeshBasicMaterial( {color} );
    var box = new THREE.Mesh( geometry, material );
    box.position.set(0,0,1)
    // 存储uuid
    box.userData = box.uuid

    objects.push(box)
    scene.add( box )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(box)

    addMeshWrap (box, color)
}
function addSphere() {
    let color = Math.random()*0xffffff;
    var geometry = new THREE.SphereGeometry( 2, 30, 30 );
    var material = new THREE.MeshBasicMaterial( {color: color} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(0,0,1)
    sphere.userData = sphere.uuid

    objects.push(sphere)
    scene.add( sphere )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(sphere)

    addMeshWrap (sphere, color)
}
function addCylinder() {
    let color = Math.random()*0xffffff;
    var geometry = new THREE.CylinderGeometry( 2, 2, 2, 30);
    var material = new THREE.MeshBasicMaterial( {color} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(0,0,1)
    cylinder.userData = cylinder.uuid

    objects.push(cylinder)
    scene.add( cylinder )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(cylinder)

    addMeshWrap (cylinder, color)
}
function addCone() {
    let color = Math.random()*0xffffff;
    var geometry = new THREE.ConeGeometry( 2, 2, 30 );
    var material = new THREE.MeshBasicMaterial( {color} );
    var cone = new THREE.Mesh( geometry, material );
    cone.position.set(0,0,1)
    cone.userData = cone.uuid

    objects.push(cone)
    scene.add( cone )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(cone)

    addMeshWrap (cone, color)
}
function addTetrahedron() {
    let color = Math.random()*0xffffff;
    var geometry = new THREE.TetrahedronGeometry( 2 );
    var material = new THREE.MeshBasicMaterial( {color} );
    var tetrahedron = new THREE.Mesh( geometry, material );
    tetrahedron.position.set(0,0,1)
    tetrahedron.userData = tetrahedron.uuid

    objects.push(tetrahedron)
    scene.add( tetrahedron )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(tetrahedron)

    addMeshWrap (tetrahedron, color)
}
function addPlane() {
    let color = Math.random()*0xffffff;
    var geometry = new THREE.PlaneGeometry( 30, 30 );
    var material = new THREE.MeshBasicMaterial( {color} );
    var plane = new THREE.Mesh( geometry, material );
    plane.position.set(0,0,1)
    plane.rotation.set(-0.5 * Math.PI, 0, 0)
    plane.userData = plane.uuid

    objects.push(plane)
    scene.add( plane )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(plane)

    addMeshWrap (plane, color)
}
// 删除Mesh
function deleteObject () {
    delGUI();
    const draggableObjects = dragControls.getObjects();
    if (draggableObjects.length > 0) {
        let obj = curObj;
        scene.remove(obj.boxHelper);
        scene.remove(obj);
        pathAddPoint (obj, false, true)
        
        for(let i = objects.length - 1; i >= 0; i--) {
           let item = objects[i];
           if (item.uuid == obj.userData) {
               objects.splice(i, 1)
               collidableMeshList.splice(i, 1)
           }
        }
        for(let i = collidableMeshList.length - 1; i >= 0; i--) {
            let item = collidableMeshList[i];
            if (item.uuid == obj.userData) {
                collidableMeshList.splice(i, 1)
            }
         }
        for(let i = draggableObjects.length - 1; i >= 0 ; i--) {
           let item = draggableObjects[i];
           if (item.uuid == obj.userData) {
                draggableObjects.splice(i, 1)
            }
        }
    }
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

    /* document.getElementById('modelFiles').addEventListener('change', function(event) {
        let files = event.target.files;
        for(let i = 0; i < files.length; i++) {
           let file = files[i];
           let lastDotIndex = file.name.lastIndexOf('.')
           let fileName = file.name.substring(0, lastDotIndex)
           let fileType = file.name.substring(lastDotIndex+1)
           
        }
        console.log(files[0], '-----------打印files');
    }) */
}


window.onload = init
window.addEventListener("resize", onResize, false)