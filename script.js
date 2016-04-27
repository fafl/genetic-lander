////////////
// Lander //
////////////

var level1data = [
    "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
    "9",
    "0 2500", "100 100", "500 50", "1000 300", "2000 300",
    "2500 0", "6500 50", "6899 100", "6999 2500",
    "4000 2000 0 0 9750 0 0"
]

var Lander = {
    read: function(fields) {
        this.points = [], // List of past points for drawing
        this.x      = parseInt(fields[0]),
        this.y      = parseInt(fields[1]),
        this.xspeed = parseInt(fields[2]),
        this.yspeed = parseInt(fields[3]),
        this.fuel   = parseInt(fields[4]),
        this.angle  = parseInt(fields[5]),
        this.power  = parseInt(fields[6])
    },
    tick: function(g) {
        this.timestep += 1;
        this.points.push([this.x, this.y]);

        // Advance the lander one timestep
        // From https://forum.codingame.com/t/mars-lander-puzzle-discussion/32/129        
        this.fuel -= this.power;
        var arcAngle = -this.angle * Math.PI / 180;
        var xacc = Math.sin(arcAngle) * this.power;
        var yacc = Math.cos(arcAngle) * this.power - g;
        this.xspeed += xacc;
        this.yspeed += yacc;
        this.x += this.xspeed - (xacc * 0.5);
        this.y += this.yspeed - (yacc * 0.5);
    }
}

var Level = {
    read: function(levelData) {
        var fields = levelData[0].split(" ");
        this.timestep   = 0,
        this.width      = parseInt(fields[0]),
        this.height     = parseInt(fields[1]),
        this.g          = parseFloat(fields[2]),
        this.max_thrust = parseInt(fields[7]),
        this.min_angle  = parseInt(fields[8]),
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
        fields = levelData[i+2].split(" ")
        this.lander = Object.create(Lander);
        this.lander.read(fields);
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
            .attr("points", polylineString)
            .style("stroke", "black")
            .style("fill", "none")

        // Draw lander path
        polylineString = this.toPolylineString(level.lander.points);
        var path = svgContainer.append("polyline")
            .attr("points", polylineString)
            .style("stroke", "black")
            .style("fill", "none")    
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
        this.lander.tick(this.g);
    }
}
