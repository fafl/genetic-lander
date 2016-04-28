define([
], function() {
    return {
        init: function(levelData) {
            this.timestep   = 0
            this.landers    = []
            var fields = levelData[0].split(" ");
            this.width      = parseInt(fields[0])
            this.height     = parseInt(fields[1])
            this.g          = parseFloat(fields[2])
            this.max_thrust = parseInt(fields[7])
            this.min_angle  = parseInt(fields[8])
            this.max_angle  = parseInt(fields[9])
            var numberOfPoints  = parseInt(levelData[1])
            this.points = [];
            for (var i = 0; i < numberOfPoints; i++) {
                var points = levelData[i+2].split(" ");
                this.points.push([
                    parseInt(points[0]),
                    parseInt(points[1])
                ]);
            }
            this.defaultLanderFields = levelData[i+2].split(" ")
            return this;
        },
        draw: function() {

            // Create svg element
            var svgContainer = d3.select("body").append("svg")
                .attr("width", this.width * 0.2)
                .attr("height", this.height * 0.2)
                .attr("viewBox", "0 " + this.height + " " + this.width + " 0")
                .attr("viewBox", "0 0 " + this.width + " " + this.height)

            // Draw terrain
            var polylineString = this.toPolylineString(this.points);
            var terrain = svgContainer.append("polyline")
                .attr("class", "terrain")
                .attr("points", polylineString)
                .style("stroke", "black")
                .style("stroke-width", "10")
                .style("fill", "none")

            // Draw lander path
            for (var i = 0; i < this.landers.length; i++) {
                polylineString = this.toPolylineString(this.landers[i].points);
                svgContainer.append("polyline")
                    .attr("class", "flightpath")
                    .attr("points", polylineString)
                    .style("stroke", this.landers[i].color)
                    .style("stroke-width", "10")
                    .style("fill", "none")
            }
        },
        clearFlightPaths: function() {
            d3.selectAll(".flightpath").remove();
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
                this.landers[i].tick(this.g);
            }
        }
    }
})