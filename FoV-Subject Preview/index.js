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
}

function update(){
    console.log("update");

    var inputFL = parseFloat($("#FLinput").val());
    var inputDist = parseFloat($("#Distinput").val());
    var res = FLmagic(inputFL*(10**-3), 23.6*(10**-3), 15.6*(10**-3), inputDist);

    $("#AOVW").text(res[0].toFixed(2));
    $("#AOVH").text(res[1].toFixed(2));
    $("#FOVW").text(res[2].toFixed(2));
    $("#FOVH").text(res[3].toFixed(2));
    
    TargetCalc(res[2], res[3], parseFloat($("#TargW").val()), parseFloat($("#TargH").val()));
}

$(document).ready(function(){

    TargetCalc(13.11, 8.67, parseFloat($("#TargW").val()), parseFloat($("#TargH").val()));
    
    $(window).resize(function(){
        update();
    });

    $('.UsrIn').on('input', function(){
        update();
    });

    $('#Apache').click(function(){
        $('#TargW').val('17.73');
        $('#TargH').val('4.95');
        update();
    });

    $('#Chinook').click(function(){
        $('#TargW').val('19.4');
        $('#TargH').val('5.63');
        update();
    });
});

