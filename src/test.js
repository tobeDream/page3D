var scene,camera,controls,renderer,cube,originPoint;
var WIDTH,HEIGHT;
var objects = [];
//创建渲染器
function initRenderer(){
 WIDTH = window.innerWidth;
 HEIGHT = window.innerHeight;
 renderer = new THREE.WebGLRenderer({
  antialias:true,
 });
 renderer.setSize(WIDTH,HEIGHT);
 renderer.setPixelRatio(WIDTH/HEIGHT);
 document.getElementById('WebGL-output').appendChild(renderer.domElement);
 
}
//创建场景
function initScene(){
 scene = new THREE.Scene();
 scene.background = new THREE.Color( 0xf0f0f0 );
}
//创建相机
function initCamera(){
 camera = new THREE.PerspectiveCamera(50,WIDTH/HEIGHT,1,10000);
 camera.position.set(0,0,1000);
 camera.lookAt(0,0,0);
}
//创建光源
function initLight(){
 // 方向光
 var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
 scene.add( directionalLight );
 // 环境光
 scene.add( new THREE.AmbientLight( 0x505050 ) );
}
//创建对象
function initObject(){
 var geometry = new THREE.BoxBufferGeometry( 40, 40, 40 );
 
 for ( var i = 0; i < 2; i ++ ) {
 
  var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  //随机位置
  object.position.x = Math.random() * 1000 - 500;
  object.position.y = Math.random() * 600 - 300;
  object.position.z = Math.random() * 800 - 400;
  //随机角度
  object.rotation.x = Math.random() * 2 * Math.PI;
  object.rotation.y = Math.random() * 2 * Math.PI;
  object.rotation.z = Math.random() * 2 * Math.PI;
  //随机大小
  object.scale.x = Math.random() * 2 + 1;
  object.scale.y = Math.random() * 2 + 1;
  object.scale.z = Math.random() * 2 + 1;
  //开启阴影
  object.castShadow = true;
  object.receiveShadow = true;
 
  scene.add( object );
  // 放入数组
  objects.push( object );
 
 }
 // 
 var geometry = new THREE.BoxGeometry( 80, 80, 80 );
 var material = new THREE.MeshLambertMaterial( {color: 0xfff000} );
 cube = new THREE.Mesh( geometry, material );
 scene.add( cube );
 /**
  * .clone () : Vector3
  * 返回一个新的Vector3，其具有和当前这个向量相同的x、y和z。
  */
 originPoint = cube.position.clone();
 
}
//创建控制器
function initControls(){
 // TrackballControls 轨迹球控件，最常用的控件，可以使用鼠标轻松的移动、平移，缩放场景。
 controls = new THREE.TrackballControls( camera );
 controls.rotateSpeed = 1.0;// 旋转速度
 controls.zoomSpeed = 1.2;// 缩放速度
 controls.panSpeed = 0.8;// 平controls
 controls.noZoom = false;
 controls.noPan = false;
 controls.staticMoving = true;// 静止移动，为 true 则没有惯性
 controls.dynamicDampingFactor = 0.3;// 阻尼系数 越小 则滑动越大
 // DragControls 初始化拖拽控件
 var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
 // 开始拖拽
 dragControls.addEventListener( 'dragstart', function () {
 
  controls.enabled = false;
 
 } );
 // 拖拽结束
 dragControls.addEventListener( 'dragend', function () {
 
  controls.enabled = true;
 
 } );
}
 
function initThree(){
 initRenderer();
 initScene();
 initCamera();
 initLight();
 initObject();
 initControls();
 animation();
}
//循环
function animation(){
 requestAnimationFrame(animation);
 renderer.render(scene,camera);
 // 更新控制器
 controls.update();
 // 循环碰撞检测
 for (var i = 0; i < cube.geometry.vertices.length; i++) {
  // 顶点原始坐标
  var localVertex = cube.geometry.vertices[i].clone();
  // 顶点经过变换后的坐标
  // matrix 局部变换矩阵。 applyMatrix4 并返回新Matrix4(4x4矩阵)对象.
  var globalVertex = localVertex.applyMatrix4(cube.matrix);
  // 获得由中心指向顶点的向量
  var directionVector = globalVertex.sub(cube.position);
  // 将方向向量初始化
  var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
  // 检测射线与多个物体的相交情况
  var collisionResults = ray.intersectObjects(objects);
  // 如果返回结果不为空，且交点与射线起点的距离小于物体中心至顶点的距离，则发生了碰撞
  if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
   console.log('碰撞！');
  }
 }
 
}

window.onload =  initThree()