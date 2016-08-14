define([
    "level"
], function(Level) {
    var leveldata = [
        "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
        "7",
        "0 2000",       // terrain left
        "1000 100",     // l1
        "2000 100",     // l2
        "2500 500",     // terrain right
        "1500 1000",    // directly above landing area
        "6900 1800",    // far away behind corner
        "6999 2000",    // far away behind corner

        // Lander config
        "6500 2300 -50 10 1750 0 0"
    ]

    var expectedDistances = [
        null,
        0,
        0,
        640,
        1000,
        null,
        null
    ]

    return {
        run: function() {
            this.testDistances();
        },
        // Checks if the distances to the landing zone are correct
        testDistances: function() {
            var level = Object.create(Level).init(leveldata);
            console.log(JSON.stringify(level.points))

            for (var i = 0; i < level.points.length; i++) {
                var expected = expectedDistances[i];
                if (expected == null) {
                    continue
                }
                var actual = Math.round(level.points[i].distance);
                if (expected != actual) {
                    console.error(i + ": " + expected + " != " + actual);
                }
            }
        }
    }
});




