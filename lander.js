define([
], function() {
    return {
            init: function(fields) {
            this.points     = [] // List of past points for drawing
            this.commands   = []
            this.color      = "black"
            this.isFlying   = true
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
        tick: function(g) {
            if (!this.isFlying) {
                return;
            }
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

            // TODO if we just crossed a wall or the level boundary we stop
            // if boom then this.isFlying = false
        },
        createRandomCommands: function(count) {
            var angle = this.angle;
            for (var i = 0; i < count; i++) {
                angle += this.getRandomInt(-15, 15)
                angle = Math.min(angle, 90)
                angle = Math.max(angle, -90)
                power = this.getRandomInt(0, 4)
                this.commands.push([angle, power]);
            }
            return this;
        },
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
});