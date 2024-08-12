
// SETUP
const framerate = 60;
const lineSpacing = 35;

// use the first canvas size to set as all, because they should all be the same sizes
const canvas_size = setSize(document.getElementById("div5"));

var x = 0;
var y = 0;
var z = 0;

var r = 0;
var theta = 0;


function setSize(elem) {
	let height = elem.clientHeight;
	let width = elem.clientWidth;
	return height > width ? width : height;
}


function calcMaxGridHalfSide(){
    let cnt = 0;
    for (let j = 0; j < canvas_size / 2 - lineSpacing; j += lineSpacing) {
        cnt += 1;
    }
	return cnt * lineSpacing;
}

// update variables when slider is moved, set according to max canvas size
const max_grid_side = calcMaxGridHalfSide()*2
document.getElementById("xCoord").oninput = function() {
	x = this.value * (max_grid_side/200);
	updateRTheta(x, y);
}
document.getElementById("yCoord").oninput = function() {
	y = 2 * this.value * (max_grid_side/200);
	updateRTheta(x, y);
}
document.getElementById("zCoord").oninput = function() {
	z = this.value;
	updateRTheta(x, y);
}

function updateRTheta(x, y){
	r = Math.sqrt(x*x + y*y);
	theta = Math.atan2(x, y);
}








var s1 = function (sketch) {
	sketch.setup = function () {
		sketch.frameRate(framerate);
		let canvas1 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
		canvas1.position(0, 0);
		canvas1.parent("div5");
		canvas1.style('position', 'relative');

		sketch.noFill();
	}

	sketch.draw = function () {
		sketch.clear();
		sketch.background(100);
		ppiDrawBase(sketch, canvas_size);
	}
};


new p5(s1);



var s2 = function (sketch) {

	sketch.setup = function () {
		sketch.frameRate(framerate);
		let canvas2 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
		canvas2.position(0, 0);
		canvas2.parent("div6");
		canvas2.style('position', 'relative');

		sketch.noFill();
	}

	sketch.draw = function () {
		sketch.clear();
		sketch.background(100);
		sectorppiDrawBase(sketch, canvas_size, lineSpacing);
		sectorppiDrawBogey(sketch, canvas_size, lineSpacing, r, theta, z);
	}
};
new p5(s2);



var s3 = function (sketch) {

	sketch.setup = function () {
		sketch.frameRate(framerate);
		let canvas3 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
		canvas3.position(0, 0);
		canvas3.parent("div7");
		canvas3.style('position', 'relative');

		sketch.noFill();
	}

	sketch.draw = function () {
		sketch.clear();
		sketch.background(100);
		ascopeDrawBase(sketch, canvas_size, lineSpacing);
		ascopeDrawLine(sketch, canvas_size, lineSpacing, r, theta);
		ascopeDrawBorder(sketch, canvas_size, lineSpacing);
	}
};
new p5(s3);



var s4 = function (sketch) {

	sketch.setup = function () {
		sketch.frameRate(framerate);
		let canvas4 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
		canvas4.position(0, 0);
		canvas4.parent("div13");
		canvas4.style('position', 'relative');

		sketch.noFill();
	}

	sketch.draw = function () {
		sketch.clear();
		sketch.background(100);
		bscopeDrawBase(sketch, canvas_size, lineSpacing);
	}
};
new p5(s4);



var s5 = function (sketch) {

	sketch.setup = function () {
		sketch.frameRate(framerate);
		let canvas5 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
		canvas5.position(0, 0);
		canvas5.parent("div14");
		canvas5.style('position', 'relative');

		sketch.noFill();
	}

	sketch.draw = function () {
		sketch.clear();
		sketch.background(100);
		cscopeDrawBase(sketch, canvas_size, lineSpacing);
	}
};
new p5(s5);



var s6 = function (sketch) {

	sketch.setup = function () {
		sketch.frameRate(60);
		let canvas6 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
		canvas6.position(0, 0);
		canvas6.parent("div15");
		canvas6.style('position', 'relative');

		
		sketch.camera(0, -750, 500);
	}

	sketch.draw = function () {
		sketch.clear();
		sketch.background(100);
		editorDrawScene(sketch, canvas_size, lineSpacing, x, y, z);
	}
};
new p5(s6);








// var s7 = function (sketch) {

// 	sketch.setup = function () {
// 		sketch.frameRate(60);
// 		let canvas7 = sketch.createCanvas(canvas_size, canvas_size, sketch.WEBGL);
// 		canvas7.position(0, 0);
// 		canvas7.parent("div8");
// 		canvas7.style('position', 'relative');

		
// 		sketch.clear();
// 		sketch.background(100);

// 		let slider;
// 		slider = createSlider(0, 255);
// 		slider.position(10, 10);
// 		slider.size(80);
// 	}

// 	sketch.draw = function () {
// 		sketch.line(-100, -100, 200, 200)
// 		editorChangePos(sketch, canvas_size);
// 	}
// };
// new p5(s7);
