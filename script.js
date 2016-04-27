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

var parseLevel = function(levelData) {
    var fields = levelData[0].split(" ");
    var level = {
        timestep    : 0,
        width       : parseInt(fields[0]),
        height      : parseInt(fields[1]),
        g           : parseFloat(fields[2]),
        max_thrust  : parseInt(fields[7]),
        min_angle   : parseInt(fields[8]),
        max_angle   : parseInt(fields[9])
    };
    var numberOfPoints  = parseInt(levelData[1])
    level.points = [];
    for (var i = 0; i < numberOfPoints; i++) {
        var points = levelData[i+2].split(" ");
        level.points.push([
            parseInt(points[0]),
            parseInt(points[1])
        ]);
    }
    fields = levelData[i+2].split(" ")
    level.lander = {
        points   : [], // List of past points for drawing
        x       : parseInt(fields[0]),
        y       : parseInt(fields[1]),
        xspeed  : parseInt(fields[2]),
        yspeed  : parseInt(fields[3]),
        fuel    : parseInt(fields[4]),
        angle   : parseInt(fields[5]),
        power   : parseInt(fields[6])
    };
    level.tick = function() {
        this.timestep += 1;
        this.lander.points.push([this.lander.x, this.lander.y]);

        // Advance the lander one timestep
        // From https://forum.codingame.com/t/mars-lander-puzzle-discussion/32/129        
        this.lander.fuel -= this.lander.power;
        var arcAngle = -this.lander.angle * Math.PI / 180;
        var xacc = Math.sin(arcAngle) * this.lander.power;
        var yacc = Math.cos(arcAngle) * this.lander.power - this.g;
        this.lander.xspeed += xacc;
        this.lander.yspeed += yacc;
        this.lander.x += this.lander.xspeed - (xacc * 0.5);
        this.lander.y += this.lander.yspeed - (yacc * 0.5);
    }
    return level;
}

var draw = function(level) {

    // Create svg element
    var svgContainer = d3.select("body").append("svg")
        .attr("width", level.width * 0.2)
        .attr("height", level.height * 0.2)
        .attr("viewBox", "0 " + level.height + " " + level.width + " 0")
        .attr("viewBox", "0 0 " + level.width + " " + level.height)

    // Draw terrain
    var polylineString = toPolylineString(level.points, level);
    var terrain = svgContainer.append("polyline")
        .attr("points", polylineString)
        .style("stroke", "black")
        .style("fill", "none")

    // Draw lander path
    polylineString = toPolylineString(level.lander.points, level);
    var path = svgContainer.append("polyline")
        .attr("points", polylineString)
        .style("stroke", "black")
        .style("fill", "none")    
}

var toPolylineString = function(a, level) {

    // Converts an array of pairs to a polyline string
    // Rotates y-axis
    return a.map(function(x) {
        return x[0] + "," + (level.height-x[1])
    }).join(" ")
}
