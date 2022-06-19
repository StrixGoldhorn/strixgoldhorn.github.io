function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

function FLmagic(FL, sensor_width, sensor_height, distance = 10) {
    var aovW = 2 * Math.atan(sensor_width / (2 * FL));
    var aovH = 2 * Math.atan(sensor_height / (2 * FL));

    var fovW = 2 * Math.tan(aovW / 2) * distance;
    var fovH = 2 * Math.tan(aovH / 2) * distance;

    return [radToDeg(aovW), radToDeg(aovH), fovW, fovH];
}

function TargetCalc(FOVW, FOVH, TargW, TargH){
    var ratioW = TargW / FOVW;
    var ratioH = TargH / FOVH;
    
    var dispW = $("#vizFrame").width();
    var dispH = dispW * (2/3)

    $("#vizFrame").css("height", dispH+"px");

    var targW = dispW * ratioW;
    var targH = (dispH * ratioH) > dispH ? dispH : (dispH * ratioH);

    $("#vizTarget").css("width", targW+"px");
    $("#vizTarget").css("height", targH+"px");

    $("#vizTarget").css("line-height", $("#vizTarget").css("height"));
    if($("#vizTarget").height() < 20){
        $("#vizTarget").text("")
    }
    else{
        $("#vizTarget").text("+");
    }
}

function update(){
    var inputFL = parseFloat($("#FLinput").val());
    var inputDist = parseFloat($("#Distinput").val());

    var sensor_width = parseFloat($("#SensorW").val());
    var sensor_height = parseFloat($("#SensorH").val());

    var res = FLmagic(inputFL*(10**-3), sensor_width*(10**-3), sensor_height*(10**-3), inputDist);

    $("#AOVW").text(res[0].toFixed(2));
    $("#AOVH").text(res[1].toFixed(2));
    $("#FOVW").text(res[2].toFixed(2));
    $("#FOVH").text(res[3].toFixed(2));
    
    TargetCalc(res[2], res[3], parseFloat($("#TargW").val()), parseFloat($("#TargH").val()));
}

const wingedDB = {
    // Rotary Wing
    "Apache": {
        "TargW": 17.73,
        "TargH": 4.95
    },
    "Chinook": {
        "TargW": 19.4,
        "TargH": 5.63
    },
    "H225M": {
        "TargW": 19.5,
        "TargH": 4.97
    },
    "Seahawk": {
        "TargW": 19.8,
        "TargH": 5.23
    },

    // Fixed Wing
    "C-130": {
        "TargW": 30,
        "TargH": 40
    },
    "A330": {
        "TargW": 58.82,
        "TargH": 60.3
    },
    "F-15": {
        "TargW": 19.4,
        "TargH": 13.0
    },
    "F-16": {
        "TargW": 15,
        "TargH": 9.96
    }
}

$(document).ready(function(){

    update();
    
    $(window).resize(function(){
        update();
    });

    $('.UsrIn').on('input', function(){
        update();
    });

    $(".UsrInB").click(function(){
        $('#TargW').val(wingedDB[this.id].TargW);
        $('#TargH').val(wingedDB[this.id].TargH);
        update();
    })
});

