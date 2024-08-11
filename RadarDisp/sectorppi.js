


function sectorppiDrawBase(sketch, canvas_size, lineSpacing) {
    // 60deg total, 30deg each side
    const ringSpacing = lineSpacing * 2;

    sketch.stroke('LawnGreen');
    sketch.strokeWeight(2);

    // settings for bigger sector
    // (5/4) * sketch.PI, (7/4) * sketch.PI
    // sketch.arc(0, (9/20) * canvas_size, (17/10) * canvas_size, (17/10) * canvas_size, (4/3) * sketch.PI, (5/3) * sketch.PI, sketch.PIE);

    let i = ringSpacing

    for (; i <= (19 / 10) * canvas_size; i += ringSpacing) {
        sketch.arc(0, (9 / 20) * canvas_size, i, i, (4 / 3) * sketch.PI, (5 / 3) * sketch.PI, sketch.OPEN);
    }

    i -= ringSpacing
    sketch.arc(0, (9 / 20) * canvas_size, i, i, (4 / 3) * sketch.PI, (5 / 3) * sketch.PI, sketch.PIE);


}

function sectorppiDrawBogey(sketch, canvas_size, lineSpacing, r, theta, altitude) {
    const ringSpacing = lineSpacing * 2;
    sketch.stroke('Tomato');
    sketch.strokeWeight(5);

    let i = ringSpacing
    let cnt = 0;
    for (; i <= (19 / 10) * canvas_size; i += ringSpacing) {
        cnt += 1;
    }

    // only draw if within range

    if (r <= cnt * lineSpacing && -Math.PI/6 < theta && Math.PI/6 > theta){
        let y = -r * Math.cos(theta);
        let x = r * Math.sin(theta);
        
        let xOnScope = x;
        let yOnScope = y - (1/20) * canvas_size;
    
        sketch.translate(0, canvas_size/2);
    
        sketch.line(xOnScope-5, yOnScope, xOnScope+5, yOnScope);

    }

}