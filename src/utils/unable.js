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