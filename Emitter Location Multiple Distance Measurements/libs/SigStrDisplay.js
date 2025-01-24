class SigStrDisplay {
    constructor() {
        // Create the canvas element for the graph overlay
        this.container = document.createElement('span');
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.right = '10px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';


        this.canvas = document.createElement('canvas');  // Translucent black background
        this.canvas.width = window.innerWidth / 4;
        this.canvas.height = window.innerHeight / 4;
    
        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);

        this.ctx = this.canvas.getContext('2d');

        // Settings for signal strength graph
        this.signalStrengthHistory = [];
        this.maxHistory = 1000;  // Maximum number of points in history

        this.minSignalStrength = -150;
        this.maxSignalStrength = -10;  // Maximum expected signal strength for scaling

    }

     // Method to update the display with a new signal strength value
     updateSignalStrength(strength) {
        // Add the new signal strength to the history array
        this.signalStrengthHistory.push(strength);

        // Keep only the last `maxHistory` points
        if (this.signalStrengthHistory.length > this.maxHistory+1) {
            this.signalStrengthHistory.shift();
        }

        // Redraw the graph
        this.drawLineGraph();
    }



    // Method to draw the signal strength graph
    drawLineGraph() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.drawLineAxes();


        // Set up styles for the graph line
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 1;

        // Begin drawing the graph line
        ctx.beginPath();

        // Calculate the x-step for each point in the history
        const xStep = (width - 40) / this.maxHistory;  // Leaving space for axes

        // Calc each how much dB each px on Y axis represent
        const yStep = (height - 40) / (this.maxSignalStrength - this.minSignalStrength);
        

        this.signalStrengthHistory.forEach((strength, index) => {
            let x, y;
            x = 20 + index * xStep;
            y = height - 20 - ((strength - this.minSignalStrength)*yStep);
            if(y > height - 20){
                y = height - 20;
            } else if(y < 20){
                y = 20;
            }

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        // Stroke the graph line
        ctx.stroke();
    }

    drawLineAxes(){
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear the canvas
        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        
        // Y-axis (signal strength)
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(20, height - 20);

        // X-axis (time)
        ctx.moveTo(20, height - 20);
        ctx.lineTo(width - 20, height - 20);
        
        ctx.stroke();

        // Draw labels for the axes
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.save();
        ctx.rotate((Math.PI/2) * 3);
        ctx.fillText('dBm', -height/2, 15);
        ctx.restore();
        ctx.fillText('Time', width/2, height - 5);
    }
}

export { SigStrDisplay };