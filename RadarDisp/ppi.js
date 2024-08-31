


function ppiDrawBase(sketch, canvas_size){
    const ringSpacing = 70

    sketch.stroke('LawnGreen');
    sketch.strokeWeight(2);
    
    for(let i = ringSpacing; i <= canvas_size-10; i+=ringSpacing){
        sketch.circle(0, 0, i);
    }
}