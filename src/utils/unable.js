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
                case "width": obj.geometry.curParameters.width = val; break;
                case "height": obj.geometry.curParameters.height = val; break;
                case "depth": obj.geometry.curParameters.depth = val; break;
                case "radius": obj.geometry.curParameters.radius = val; break;
                case "radiusTop": obj.geometry.curParameters.radiusTop = val; break;
                case "radiusBottom": obj.geometry.curParameters.radiusBottom = val; break;
            }
       }
    }
}

document.getElementById('okBtn').addEventListener('click', function () {
    setCurObjMore()
})
document.getElementById('clearBtn').addEventListener('click', function () {
    clearInput()
})


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

    collidableMeshList.push(box)
    addMeshWrap (box)
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
    collidableMeshList.push(sphere)
    addMeshWrap (sphere)
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
    collidableMeshList.push(cylinder)
    addMeshWrap (cylinder)
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
    collidableMeshList.push(cone)
    addMeshWrap (cone)
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
    collidableMeshList.push(tetrahedron)
    addMeshWrap (tetrahedron)
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
function addObject (geoName) {
    var geometry;
    switch (geoName) {
        case "Box":
            geometry = new THREE.BoxGeometry( 2, 2, 2 );
            break;  
        case "Sphere":
            geometry = new THREE.SphereGeometry( 2, 30, 30 );
            break; 
        case "Cylinder":
            geometry = new THREE.CylinderGeometry( 2, 2, 2, 30);
            break; 
        case "Cone":
            geometry = new THREE.ConeGeometry( 2, 2, 30 );
            break; 
        case "Tetrahedron":
            geometry = new THREE.TetrahedronGeometry( 2 );
            break; 
        case "Plane":
            geometry = new THREE.PlaneGeometry( 30, 30 );
            break; 
    }
    var material = new THREE.MeshBasicMaterial( {color: Math.random()*0xffffff} );
    var meshObj = new THREE.Mesh( geometry, material );
    meshObj.position.set(0,0,1)
    if (geoName == 'Plane') {
        meshObj.rotation.set(-0.5 * Math.PI, 0, 0);
    }
    // 存储uuid
    meshObj.userData = meshObj.uuid

    objects.push(meshObj)
    scene.add( meshObj )
    // add to draggable
    const draggableObjects = dragControls.getObjects();
    draggableObjects.push(meshObj)
}

// 包围盒碰撞监测
// 通过包围盒监测  仅触发一次
// 包围盒更加灵敏  两几何体相交时仍能判定
function collisionWrapBox () {
    if (curObj == undefined) return null;
    let crashBox = curObj.boxWrap;
    for (let i = 1; i < objects.length; i ++) {
        let oneStone = objects[i];
        if(oneStone.userData != curObj.userData) {
            let stoneBox = oneStone.boxWrap;
            let flag = crashBox.intersectsBox(stoneBox);
            if(flag) {
                appendText(" 撞上了2 "); // 撞到了
            }
        }

    }
}