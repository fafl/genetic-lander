define([
], function() {

    // A point in the terrain of the level
    return {
        init: function(x, y) {
            this.x = x
            this.y = y
            this.distance = Number.MAX_VALUE // Distance to landing zone
            return this;
        },
        getDistanceTo: function(other) {
            return Math.sqrt(
                Math.pow(this.x - other.x, 2)
              + Math.pow(this.y - other.y, 2)
            );
        },
        getDistance: function(x, y) {
            return Math.sqrt(
                Math.pow(this.x - x, 2)
              + Math.pow(this.y - y, 2)
            );
        }
    }
})