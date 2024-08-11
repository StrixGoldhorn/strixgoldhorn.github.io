


function editorDrawScene(sketch, canvas_size, lineSpacing, x, y, z) {

    sketch.stroke('Bisque');
    sketch.strokeWeight(3);

    // find max grid div
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }

    const max_grid_side = cnt * lineSpacing * 2;

    sketch.orbitControl();
    sketch.rotateX(sketch.PI / 2);

    sketch.strokeWeight(1);
    for (let i = 0; i < cnt; i += 1) {
        sketch.stroke('Bisque');
        // horizontal
        sketch.line(cnt * lineSpacing, i * lineSpacing, -cnt * lineSpacing, i * lineSpacing);
        sketch.line(cnt * lineSpacing, -i * lineSpacing, -cnt * lineSpacing, -i * lineSpacing);

        // vertical
        sketch.line(i * lineSpacing, cnt * lineSpacing, i * lineSpacing, -cnt * lineSpacing);
        sketch.line(-i * lineSpacing, cnt * lineSpacing, -i * lineSpacing, -cnt * lineSpacing);
    }

    sketch.strokeWeight(3);
    sketch.noFill();
    sketch.square(-cnt*lineSpacing, -cnt*lineSpacing, cnt*lineSpacing*2);


    sketch.translate(0, max_grid_side/2);


    sketch.stroke('LawnGreen');
    sketch.strokeWeight(2);

    const ringSpacing = lineSpacing * 2;
    let i = ringSpacing;

    for(; i <= max_grid_side*2; i+=ringSpacing){
        sketch.arc(0, 0, i, i, (4/3) * sketch.PI, (5/3) * sketch.PI, sketch.OPEN);
    }

    i -= ringSpacing
    sketch.arc(0, 0, i, i, (4/3) * sketch.PI, (5/3) * sketch.PI, sketch.PIE);


    sketch.box(30)



    // SET UP SCENE

    // draw self
    sketch.stroke('Cyan');
    sketch.fill("LightSkyBlue");
    sketch.strokeWeight(1);
    sketch.ellipsoid(10, 10, 10, 6, 4);

    drawBogey(sketch, x, -y, z);
}

function drawBogey(sketch, x, y, z){
    sketch.stroke('HotPink');
    sketch.fill("DeepPink");
    sketch.strokeWeight(1);
    sketch.translate(x, y, z);
    sketch.ellipsoid(10, 10, 10, 6, 4);
}



function editorChangePos(sketch, canvas_size) {
    slider = sketch.createSlider(0, 255);
    slider.position(10, 10);
    slider.size(80);
}