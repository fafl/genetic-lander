define([
], function() {
    return {
        init: function(levelData) {
            this.svgContainer = null;
            this.landers    = []
            var fields = levelData[0].split(" ");
            this.width      = parseInt(fields[0])
            this.height     = parseInt(fields[1])
            this.g          = parseFloat(fields[2])
            this.max_thrust = parseInt(fields[7])
            this.min_angle  = parseInt(fields[8])
            this.max_angle  = parseInt(fields[9])
            this.landingX1  = -1
            this.landingX2  = -1
            this.landingY   = -1
            var numberOfPoints  = parseInt(levelData[1])
            this.points = [];
            var lastX = -1;
            var lastY = -1;
            for (var i = 0; i < numberOfPoints; i++) {
                var points = levelData[i+2].split(" ");
                var x = parseInt(points[0])
                var y = parseInt(points[1])
                this.points.push([x, y]);
                if (lastY != -1 && lastY == y) {
                    this.landingX1 = Math.min(x, lastX);
                    this.landingX2 = Math.max(x, lastX);
                    this.landingY  = y;
                }
                lastX = x;
                lastY = y;
            }
            this.defaultLanderFields = levelData[i+2].split(" ")
            return this;
        },
        drawTerrain: function() {

            // Create svg element
            this.svgContainer = d3.select("body").append("svg")
                .attr("width", this.width * 0.2)
                .attr("height", this.height * 0.2)
                .attr("viewBox", "0 " + this.height + " " + this.width + " 0")
                .attr("viewBox", "0 0 " + this.width + " " + this.height)

            // Draw terrain
            var polylineString = this.toPolylineString(this.points);
            terrain = this.svgContainer.append("polyline")
                .attr("class", "terrain")
                .attr("points", polylineString)
                .style("stroke", "black")
                .style("stroke-width", "10")
                .style("fill", "none")
        },
        drawLanders: function() {

            // Delete old and draw current flightpaths
            d3.selectAll(".flightpath").remove();
            for (var i = 0; i < this.landers.length; i++) {
                polylineString = this.toPolylineString(this.landers[i].points);
                this.svgContainer.append("polyline")
                    .attr("class", "flightpath")
                    .attr("points", polylineString)
                    .style("stroke", this.landers[i].color)
                    .style("stroke-width", "2")
                    .style("fill", "none")
            }
        },
        toPolylineString: function(a) {

            // Converts an array of pairs to a polyline string
            // Rotates y-axis
            var level = this;
            var coords = a.map(function(x) {
                return x[0] + "," + (level.height-x[1])
            })
            return coords.join(" ")
        },
        tick: function() {
            for (var i = 0; i < this.landers.length; i++) {
                this.landers[i].tick(this);
            }
        }
    }
})