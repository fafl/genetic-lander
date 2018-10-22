define([
    "helper",
    "point"
], function(Helper, Point) {
    return {
        init: function(levelData) {
            this.svgContainer = null;
            this.landers = []

            // Read fields
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

            // Calculate max distance (approximation)
            // TODO get actual, it must be a corner
            this.max_dist = 2 * Math.sqrt(this.width*this.width+this.height*this.height);

            // Read terrain
            var numberOfPoints  = parseInt(levelData[1])
            this.points = [];
            var lastX = -1;
            var lastY = -1;
            for (var i = 0; i < numberOfPoints; i++) {
                var points = levelData[i+2].split(" ");
                var x = parseInt(points[0])
                var y = parseInt(points[1])
                this.points.push(Object.create(Point).init(x, y));
                if (lastY != -1 && lastY == y) {
                    this.landingX1 = Math.min(x, lastX);
                    this.landingX2 = Math.max(x, lastX);
                    this.landingY  = y;
                }
                lastX = x;
                lastY = y;
            }

            // Calculate all distances to landing area
            this.calculateDistances()

            // Read initial lander state
            this.defaultLanderFields = levelData[i+2].split(" ")

            return this;
        },
        drawTerrain: function() {

            // Get svg element
            this.svgContainer = d3.select("body").select("svg")
                .attr("width", this.width * 0.2)
                .attr("height", this.height * 0.2)
                .attr("viewBox", "0 " + this.height + " " + this.width + " 0")
                .attr("viewBox", "0 0 " + this.width + " " + this.height)

            // Clean it
            this.svgContainer.selectAll("*").remove();

            // Draw terrain
            terrain = this.svgContainer.append("polyline")
                .attr("class", "terrain")
                .attr("points", this.getPolylineString())
                .style("stroke", "black")
                .style("stroke-width", "10")
                .style("fill", "none")
        },
        drawLanders: function() {

            // Delete old and draw current flightpaths
            d3.selectAll(".flightpath").remove();
            for (var i = this.landers.length - 1; 0 <= i; i--) {
                polylineString = this.toPolylineString(this.landers[i].points);

                this.svgContainer.append("polyline")
                    .attr("class", "flightpath")
                    .attr("points", polylineString)
                    .style("stroke", this.landers[i].color)
                    .style("stroke-width", "2")
                    .style("fill", "none")
            }
        },
        calculateDistances: function() {

            // Find the two points forming the landing area
            var lp1; // First landing point
            var lp2; // Second landing point
            var li; // Index of first landing point
            for (var i = 1; i < this.points.length; i++) {
                var p1 = this.points[i-1]
                var p2 = this.points[i]
                if (p1.y == p2.y) {
                    lp1 = p1;
                    lp2 = p2;
                    li = i-1;
                    break;
                }
            }
            lp1.distance = 0;
            lp2.distance = 0;

            // Propagate distances away from the landing area
            for (var i = li + 2; i < this.points.length; i++) {
                var other = this.points[i-1]
                this.points[i].distance = other.distance
                this.points[i].distance += this.points[i].getDistanceTo(other);
            }
            for (var i = li - 1; 0 <= i; i--) {
                var other = this.points[i+1]
                this.points[i].distance = other.distance
                this.points[i].distance += this.points[i].getDistanceTo(other);
            }

            // Calculate distances until nothing changes anymore
            // TODO
            var hasChanged = true;
            while (hasChanged) {
                hasChanged = false;
                for (var i = 0; i < this.points.length; i++) {
                    var pi = this.points[i];
                    for (var j = i+1; j < this.points.length; j++) {
                        var pj = this.points[j];

                    }
                }
            }
        },
        getDistanceToLandingArea: function(x, y) {
            var bestDistance = Number.MAX_VALUE;
            for (var i = 0; i < this.points.length; i++) {
                var p = this.points[i];
                var distance = p.getDistance(x, y) + p.distance;
                if (bestDistance < distance) {
                    continue
                }

                // Check if we are inside the wall?
                // TODO

                // Look for line intersections
                var found = false;
                for (var j = 1; j < this.points.length; j++) {
                    if (j == i || j - 1 == i) {
                        continue;
                    }
                    var p1 = this.points[j-1]
                    var p2 = this.points[j]
                    var collision = Helper.checkLineCollision(x, y, p.x, p.y, p1.x, p1.y, p2.x, p2.y)
                    if (collision.onLine1 && collision.onLine2) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    continue;
                }
                bestDistance = distance;
            }
            return bestDistance;
        },
        getPolylineString: function() {

            // Converts an array of pairs to a polyline string
            // Rotates y-axis
            var height = this.height;
            var coords = this.points.map(function(p) {
                return p.x + "," + (height - p.y)
            })
            return coords.join(" ")
        },
        toPolylineString: function(points) {
            // Same as above
            // TODO unify
            var height = this.height;
            var coords = points.map(function(p) {
                return p[0] + "," + (height - p[1])
            })
            return coords.join(" ")
        }
    }
})
