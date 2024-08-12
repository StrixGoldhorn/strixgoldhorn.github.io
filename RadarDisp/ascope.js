


function ascopeDrawBase(sketch, canvas_size, lineSpacing) {
    sketch.stroke('LawnGreen');
    sketch.strokeWeight(3);
    
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

    sketch.strokeWeight(3);
}

function ascopeDrawLine(sketch, canvas_size, lineSpacing, r) {
    const spacing = 2;
    const noiseIntensity = 10;
    const returnIntensity = canvas_size/10;

    sketch.stroke('PaleGreen');
    sketch.strokeWeight(5);

    // find max grid div
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }

    sketch.translate(-cnt * lineSpacing, 0);

    sketch.stroke('Red');
    sketch.strokeWeight(2);
    for (let i = 1; i < (lineSpacing * cnt * 2 + 1) / spacing; i += 1) {
        if( ((i-1) * spacing < r && (i+1) * spacing > r) && (-Math.PI/6 < theta && Math.PI/6 > theta)){
            sketch.line((i - 1) * spacing, (sketch.noise((i - 1), i) - 0.5) * noiseIntensity, i * spacing, -returnIntensity);
        }
        else{
            sketch.line((i - 1) * spacing, (sketch.noise((i - 1), i) - 0.5) * noiseIntensity, i * spacing, (sketch.noise(i, (i + 1)) - 0.5) * noiseIntensity);
        }
    }

    sketch.translate(cnt * lineSpacing, 0);

}


function ascopeDrawBorder(sketch, canvas_size, lineSpacing){
    sketch.stroke('LawnGreen');
    sketch.strokeWeight(3);
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }
    sketch.square(-cnt * lineSpacing, -cnt * lineSpacing, cnt * lineSpacing * 2);
}