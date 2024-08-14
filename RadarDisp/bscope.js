


function bscopeDrawBase(sketch, canvas_size, lineSpacing) {

    sketch.stroke('LawnGreen');
    sketch.strokeWeight(3);

    // sketch.square(30-canvas_size/2, 30-canvas_size/2, canvas_size-60, 120);

    // find max grid div
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }



    sketch.strokeWeight(1);
    for (let i = 0; i < cnt; i += 1) {
        sketch.stroke('LawnGreen');
        // horizontal
        sketch.line(cnt * lineSpacing, i * lineSpacing, -cnt * lineSpacing, i * lineSpacing);
        sketch.line(cnt * lineSpacing, -i * lineSpacing, -cnt * lineSpacing, -i * lineSpacing);

        // vertical
        sketch.line(i * lineSpacing, cnt * lineSpacing, i * lineSpacing, -cnt * lineSpacing);
        sketch.line(-i * lineSpacing, cnt * lineSpacing, -i * lineSpacing, -cnt * lineSpacing);
    }
}

function bscopeDrawBogey(sketch, canvas_size, lineSpacing, r, theta) {

    // total 60deg, 30deg on each side
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }

    let x = (theta * 6 * cnt * lineSpacing) / Math.PI;
    let y = r;

    sketch.translate(0, cnt * lineSpacing);
    if (r <= cnt *2* lineSpacing && -Math.PI / 6 < theta && Math.PI / 6 > theta) {
        sketch.stroke('Tomato');
        sketch.strokeWeight(5);
        sketch.line(x - 5, -y, x + 5, -y);
    }
    sketch.translate(0, -cnt * lineSpacing);
}

function bscopeDrawBorder(sketch, canvas_size, lineSpacing) {
    sketch.stroke('LawnGreen');
    sketch.strokeWeight(3);
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }
    sketch.square(-cnt * lineSpacing, -cnt * lineSpacing, cnt * lineSpacing * 2);
}