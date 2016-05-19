define([
    "helper"
], function(Helper) {
    return {
        init: function(fields) {
            this.timestep   = 0
            this.points     = [] // List of past points for drawing
            this.commands   = []
            this.color      = "black"
            this.isFlying   = true
            this.score      = -1
            this.x          = parseInt(fields[0])
            this.y          = parseInt(fields[1])
            this.xspeed     = parseInt(fields[2])
            this.yspeed     = parseInt(fields[3])
            this.fuel       = parseInt(fields[4])
            this.angle      = parseInt(fields[5])
            this.power      = parseInt(fields[6])
            this.initX      = this.x
            this.initY      = this.y
            this.initXSpeed = this.xspeed
            this.initYSpeed = this.yspeed
            this.initFuel   = this.fuel
            this.initAngle  = this.angle
            this.lastDiff   = 0;
            return this;
        },
        setColor: function(color) {
            this.color = color;
            return this;
        },
        tick: function(level) {
            if (!this.isFlying) {
                return;
            }
            this.timestep += 1;
            this.points.push([this.x, this.y]);

            // Advance the lander one timestep
            // From https://forum.codingame.com/t/mars-lander-puzzle-discussion/32/129
            if (this.fuel < this.power) {
                this.power = this.fuel;
            }
            this.fuel -= this.power;
            var arcAngle = -this.angle * Math.PI / 180;
            var xacc = Math.sin(arcAngle) * this.power;
            var yacc = Math.cos(arcAngle) * this.power - level.g;
            this.xspeed += xacc;
            this.yspeed += yacc;
            this.x += this.xspeed - (xacc * 0.5);
            this.y += this.yspeed - (yacc * 0.5);

            // If we left the level we stop
            if (this.x < 0 || level.width <= this.x || this.y < 0 || level.height <= this.y) {
                this.isFlying = false;
                this.calculateScore(level, false);
                return;
            }

            // If we hit terrain we stop
            var lastX = this.points[this.points.length-1][0];
            var lastY = this.points[this.points.length-1][1];
            for (var i = 1; i < level.points.length; i++) {
                var tx1 = level.points[i-1][0];
                var ty1 = level.points[i-1][1];
                var tx2 = level.points[i  ][0];
                var ty2 = level.points[i  ][1];
                var collision = Helper.checkLineCollision(lastX, lastY, this.x, this.y, tx1, ty1, tx2, ty2)
                if (collision.onLine1 && collision.onLine2) {
                    this.isFlying = false;
                    this.points.push([collision.x, collision.y]);
                    this.calculateScore(level, ty1 == ty2);
                    return;
                }
            }
        },
        // Score is used to order landers by performance
        calculateScore: function(level, hitLandingArea) {
            var currentSpeed = Math.sqrt(Math.pow(this.xspeed, 2) + Math.pow(this.yspeed, 2));

            // 0-100: crashed somewhere, calculated by distance to landing area
            if (!hitLandingArea) {

                // Check how many waypoints we hit
                var nextWaypointIndex = 0;
                for (var i = 1; i < this.points.length; i++) {
                    if (nextWaypointIndex == level.waypoints.length) {
                        // We hit all waypoints
                        break;
                    }
                    var px1 = this.points[i-1][0];
                    var py1 = this.points[i-1][1];
                    var px2 = this.points[i  ][0];
                    var py2 = this.points[i  ][1];
                    while (true) {
                        if (nextWaypointIndex == level.waypoints.length) {
                            // We hit all waypoints
                            break;
                        }
                        var wp = level.waypoints[nextWaypointIndex];
                        var collision = Helper.checkLineCollision(
                            px1, py1, px2, py2, wp[0], wp[1], wp[2], wp[3])
                        if (collision.onLine1 && collision.onLine2) {
                            nextWaypointIndex++;
                        }
                        else {
                            break;
                        }
                    }
                }

                // Calculate distance to next waypoint or landing area
                var tx, ty;
                if (nextWaypointIndex == level.waypoints.length) {
                    tx = (level.landingX1 + level.landingX2) / 2;
                    ty = level.landingY;
                }
                else {
                    var wp = level.waypoints[nextWaypointIndex];
                    tx = (wp[0] + wp[2]) / 2;
                    ty = (wp[1] + wp[3]) / 2;
                }
                var px = this.points[this.points.length-1][0];
                var py = this.points[this.points.length-1][1];
                var distance = Math.sqrt(
                                    Math.pow(tx-px, 2)+
                                    Math.pow(ty-py, 2));

                // Calculate score from distance
                var incScore = 100 / (level.waypoints.length + 1);
                var maxScore = incScore * (nextWaypointIndex + 1);
                this.score = maxScore - (incScore * distance / level.max_dist);

                // High speeds are bad, they decrease maneuvrability
                var speedPen = 0.1 * Math.max(currentSpeed - 100, 0);
                this.score -= speedPen;
            }

            // 100-200: crashed into landing area, calculated by speed above safety
            else if (this.yspeed < -40 || 20 < Math.abs(this.xspeed)) {
                var xPen = 0;
                if (20 < Math.abs(this.xspeed)) {
                    xPen = (Math.abs(this.xspeed) - 20) / 2
                }
                var yPen = 0
                if (this.yspeed < -40) {
                    yPen = (-40 - this.yspeed) / 2
                }
                this.score = 200 - xPen - yPen
                return;
            }

            // 200-300: landed safely, calculated by fuel remaining
            else {
                this.score = 200 + (100 * this.fuel / this.initFuel)
            }

            // Set color according to score
            this.setColor(Helper.rainbow(300 + 300, this.score))
        },
        inheritCommands: function(mom, dad) {
            for (var i = 0; i < this.commands.length; i++) {

                // Take some from mom and some from dad
                var momAngle = mom.commands[i][0];
                var momPower = mom.commands[i][1];
                var dadAngle = dad.commands[i][0];
                var dadPower = dad.commands[i][1];
                var newAngle = momAngle + Math.random() * (dadAngle - momAngle)
                var newPower = momPower + Math.random() * (dadPower - momPower)
                this.commands[i] = [newAngle, newPower]

                // Mutation
                // Better parent score -> Lower mutation
                // Later command -> Higher mutation
                var nobility = 0.1;
                if (100 < Math.max(mom.score, dad.score)) {
                    nobility = 0.05;
                }
                if (200 < Math.max(mom.score, dad.score)) {
                    nobility = 0.02;
                }
                var progress = i / this.commands.length
                var progressChance = 0.4 + 1.0 * progress// + 1.0 * Math.pow(progress, 2)
                var mutationChance = nobility * progressChance
                if (Math.random() < mutationChance) {
                    this.commands[i][0] += Helper.getRandomInt(-10, 10)
                    this.commands[i][1] += Math.random() - 0.5
                }
            }
        },
        reset: function() {
            this.points   = [];
            this.isFlying = true;
            this.timestep = 0;
            this.x        = this.initX;
            this.y        = this.initY;
            this.xspeed   = this.initXSpeed;
            this.yspeed   = this.initYSpeed;
            this.angle    = this.initAngle;
            this.fuel     = this.initFuel;
        },
        applyCommand: function(t) {
            // Read current command
            var newAngle = this.commands[t][0];
            var newPower = this.commands[t][1];

            // Set angle
            // TODO when almost landed set angle to 0
            newAngle = Math.round(newAngle)
            newAngle = Math.max(newAngle, -90)
            newAngle = Math.min(newAngle,  90)
            if (newAngle + 15 < this.angle) {
                this.angle -= 15;
            }
            else if (this.angle + 15 < newAngle) {
                this.angle += 15;
            }
            else {
                this.angle = newAngle;
            }

            // Set power
            newPower += this.lastDiff;
            var roundedPower = Math.round(newPower);
            roundedPower = Math.max(roundedPower, 0);
            roundedPower = Math.min(roundedPower, 4);
            this.lastDiff = newPower - roundedPower;
            this.power = roundedPower
        },
        printActualCommands: function() {
            var result = [];
            this.angle = this.initAngle
            for (var t = 0; t < this.timestep; t++) {
                this.applyCommand(t)
                result.push([this.angle, this.power])
            }
            result.push([0,4])
            result.push([0,4])
            result.push([0,4])
            console.log(JSON.stringify(result))
        },
        createRandomCommands: function(count) {
            var angle = this.angle;
            for (var i = 0; i < count; i++) {
                angle += Helper.getRandomInt(-15, 15);
                angle = Math.min(angle,  90);
                angle = Math.max(angle, -90);
                var power = 5 * Math.random();
                this.commands.push([angle, power]);
            }
            return this;
        }
    }
});
