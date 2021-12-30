var colorObj2Str = function(color) {
    let str = 'rgb(';
    str += color.r*255 + ',';
    str += color.g*255 + ',';
    str += color.b*255 + ')';
    return str;
}
var colorHex = function(colorObj){
    color = colorObj2Str(colorObj)
    var that = color;
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是rgb颜色表示
    if (/^(rgb|RGB)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i=0; i<aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            if (hex.length < 2) {
                hex = '0' + hex;    
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = that;    
        }

        return strHex;
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/,"").split("");
        if (aNum.length === 6) {
            return that;    
        } else if(aNum.length === 3) {
            var numHex = "#";
            for (var i=0; i<aNum.length; i+=1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    }
    
    return that;
};

function getTheMaterialType (material) {
    if (material.wireframe) {
        return "Wireframe";
    } else {
        let typeName = material.type;
        switch(typeName[4]) {
            case 'L': return "Lambert";
            case 'P': return "Phong";
            default: return "Basic";
        }
    }
}
window.colorHex = colorHex;
window.getTheMaterialType = getTheMaterialType;