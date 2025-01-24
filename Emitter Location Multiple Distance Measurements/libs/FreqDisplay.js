class FreqDisplay {
    constructor(bandwidth, bandwidthStart) {
        // Create the canvas element for the graph overlay
        this.container = document.createElement('span');
        this.container.style.position = 'absolute';
        this.container.style.bottom = '10px';
        this.container.style.right = '10px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

        this.canvas = document.createElement('canvas');  // Translucent black background
        this.canvas.width = window.innerWidth - 20;
        this.canvas.height = window.innerHeight / 4;

        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);

        this.ctx = this.canvas.getContext('2d');

        this.bandwidth = bandwidth;
        this.bandwidthStart = bandwidthStart;
        this.minSignalStrength = -100;
        this.maxSignalStrength = -10;  // Maximum expected signal strength for scaling

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(width - 10, 20);
        ctx.stroke();

    }

    // Method to update the display with a new signal strength value
    updateFreqDisp(freqSigStrArr) {
        // Redraw the graph
        this.drawBarGraph(freqSigStrArr);
    }



    // Method to draw the signal strength graph
    drawBarGraph(freqSigStrArr) {

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.drawBarAxes();

        // Begin drawing the graph line
        ctx.beginPath();

        // Calculate the x-step for each Hz
        const xStep = (width - 40) / this.bandwidth;

        // Calc each how much dB each px on Y axis represent
        const yStep = (height - 40) / (this.maxSignalStrength - this.minSignalStrength);

        const outlierLimit = getAverage(freqSigStrArr) + 3 * getStandardDeviation(freqSigStrArr);

        freqSigStrArr.forEach((strength, index) => {
            let x, y;
            x = 20 + index * xStep;
            y = height - 20 - ((strength - this.minSignalStrength) * yStep);
            if (y > height - 20) {
                y = height - 20;
            } else if (y < 20) {
                y = 20;
            }

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Find outliers
            if(strength > outlierLimit){
                ctx.fillText(this.bandwidthStart + index, x, y);
            }
        });


        // Stroke the graph line
        ctx.stroke();

        function getStandardDeviation(array) {
            const n = array.length
            const mean = array.reduce((a, b) => a + b) / n
            return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
        };

        function getAverage(array) {
            let sum = 0;
            for (let i = 0; i < array.length; i++) {
                sum += array[i];
            }
            return sum / array.length;
        }
    }

    drawBarAxes() {
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
        ctx.rotate((Math.PI / 2) * 3);
        ctx.fillText('dBm', -height / 2, 15);
        ctx.restore();
        ctx.fillText('Freq', width / 2, height - 5);

        // Set up styles for the graph line
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
    }


}

export { FreqDisplay };