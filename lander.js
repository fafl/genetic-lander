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
            if (this.x < 0 || level.width <= this.x || this.y < 0 || this.height < this.y) {
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
        calculateScore: function(level, hitLandingArea) {
            // Score is used to order landers by performance

            // 0-100: crashed somewhere, calculated by distance to landing area
            if (!hitLandingArea) {
                var lx = (level.landingX2 - level.landingX1) / 2;
                var ly = level.landingY;
                var px = this.points[this.points.length-1][0];
                var py = this.points[this.points.length-1][1];
                var distance = Math.sqrt(
                                    Math.pow(lx-px, 2) +
                                    Math.pow(ly-py, 2));
                var maxDistance = Math.sqrt(
                                    Math.pow(level.width, 2) +
                                    Math.pow(level.height, 2));
                this.score = 100 - (100 * distance / maxDistance);
                return;
            }

            // 100-200: crashed into landing area, calculated by speed above safety
            this.score = 150;
            
            // 200-300: landed safely, calculated by fuel remaining
            // TODO
        },
        copyCommandsAndMutate: function(other, count) {
            var lastAngle = this.angle;
            for (var i = 0; i < count; i++) {
                var otherCommand = other.commands[i]
                var angle = otherCommand[0];
                angle += Helper.getRandomInt(-10, 10)
                angle = Math.min(angle,  90, otherCommand[0] + 15)
                angle = Math.max(angle, -90, otherCommand[0] - 15)
                lastAngle = angle;
                var power = otherCommand[1]
                power += Helper.getRandomInt(-1, 1)
                power = Math.min(power, 4)
                power = Math.max(power, 0)
                this.commands.push([angle, power]);
            }
        },
        createRandomCommands: function(count) {
            var angle = this.angle;
            for (var i = 0; i < count; i++) {
                angle += Helper.getRandomInt(-15, 15)
                angle = Math.min(angle, 90)
                angle = Math.max(angle, -90)
                var power = Helper.getRandomInt(0, 4)
                this.commands.push([angle, power]);
            }
            return this;
        }
    }
});