define([
    "helper"
], function(Helper) {
    return {
        init: function(fields) {
            this.timestep   = 0
            this.points     = [] // List of past points for drawing // TODO point class?
            this.speeds     = [] // List of past speeds for debugging
            this.commands   = [] // List of commands, unbounded
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
            this.initPower  = this.power
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
            this.speeds.push([this.xspeed, this.yspeed])

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
                var p1 = level.points[i-1];
                var p2 = level.points[i];
                var collision = Helper.checkLineCollision(lastX, lastY, this.x, this.y, p1.x, p1.y, p2.x, p2.y)
                if (collision.onLine1 && collision.onLine2) {
                    this.isFlying = false;
                    this.points.push([collision.x, collision.y]);
                    this.calculateScore(level, p1.y == p2.y);
                    return;
                }
            }
        },
        // Score is used to order landers by performance
        calculateScore: function(level, hitLandingArea) {
            var currentSpeed = Math.sqrt(Math.pow(this.xspeed, 2) + Math.pow(this.yspeed, 2));

            // 0-100: crashed somewhere, calculate score by distance to landing area
            if (!hitLandingArea) {

                var lastX = this.points[this.points.length-2][0];
                var lastY = this.points[this.points.length-2][1];
                var distance = level.getDistanceToLandingArea(lastX, lastY);

                // Calculate score from distance
                this.score = 100 - (100 * distance / level.max_dist);

                // High speeds are bad, they decrease maneuvrability
                var speedPen = 0.1 * Math.max(currentSpeed - 100, 0);
                this.score -= speedPen;
            }

            // 100-200: crashed into landing area, calculate score by speed above safety
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

            // 200-300: landed safely, calculate score by fuel remaining
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
                var mudblood = 5;
                if (100 < Math.max(mom.score, dad.score)) {
                    mudblood = 3;
                }
                if (200 < Math.max(mom.score, dad.score)) {
                    mudblood = 1;
                }
                var progress = i / this.commands.length
                var progressChance = 0.4 + 1.0 * progress// + 1.0 * Math.pow(progress, 2)
                var mutationChance = 0.02 * mudblood * progressChance
                if (Math.random() < mutationChance) {
                    this.commands[i][0] += Helper.getRandomInt(-10, 10)
                    this.commands[i][1] += Math.random() - 0.5
                }
            }
        },
        reset: function() {
            this.points   = []; // TODO recycle objects?
            this.speeds   = []; // TODO recycle objects?
            this.isFlying = true;
            this.timestep = 0;
            this.x        = this.initX;
            this.y        = this.initY;
            this.xspeed   = this.initXSpeed;
            this.yspeed   = this.initYSpeed;
            this.angle    = this.initAngle;
            this.power    = this.initPower;
            this.fuel     = this.initFuel;
            this.lastDiff = 0;
        },
        applyCommand: function(t) {
            // Read current command
            var newAngle = this.commands[t][0];
            var newPower = this.commands[t][1];

            // Set angle
            // TODO when almost landed set angle to 0?
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
            roundedPower = Math.max(roundedPower, 0, this.power - 1);
            roundedPower = Math.min(roundedPower, 4, this.power + 1);
            this.lastDiff = newPower - roundedPower;
            this.power = roundedPower
        },
        printActualCommands: function() {
            var result = [];
            this.angle = this.initAngle
            this.power = this.initPower
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
