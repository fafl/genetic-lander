define([
    "d3.min",
    "lander",
    "level"
], function(d3, Lander, Level) {

    var NUMBER_OF_LANDERS = 200;
    var REPRODUCING_LANDERS = 10;
    var MAX_TIMESTEP = 200;

    var level1data = [
        "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
        "14",
        "0 2500", "100 200", "500 150", "1000 2000", "2000 2000",
        "2010 1500", "2200 800", "2500 200", "6899 300", "6999 2500",
        "4100 2600", "4000 1200", "3500 1100", "3400 2900",
        "4500 2300 50 -10 1750 0 0"
    ]

    var times = 0;
    var bestLander = null;

    // Load level
    var level = Object.create(Level).init(level1data);
    level.drawTerrain();

    // How things are run here
    var run = function() {
        if (times <= 0) {
            console.log(bestLander)
            return
        }
        times -= 1;

        // Create initial random landers
        if (level.landers.length == 0) {
            for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
                level.landers.push(
                    Object.create(Lander)
                        .init(level.defaultLanderFields)
                        .createRandomCommands(MAX_TIMESTEP)
                )
            }
        }

        // Evolve existing landers
        else {
            for (var i = REPRODUCING_LANDERS; i < NUMBER_OF_LANDERS; i++) {
                var momIndex = Math.floor(i / REPRODUCING_LANDERS) - 1;
                var dadIndex = i % REPRODUCING_LANDERS;
                level.landers[i].inheritCommands(
                    level.landers[momIndex],
                    level.landers[dadIndex]
                );
                level.landers[i].reset();
            }
        }

        // Fly you fools
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            var lander = level.landers[i];
            for (var t = 0; t < MAX_TIMESTEP; t++) {
                lander.applyCommand(t);
                lander.tick(level);
            }
            // Lander did not touch terrain
            if (lander.score == -1) {
                lander.calculateScore(level, false);
            }
        }

        // Find best lander
        level.landers = level.landers.sort(function(a,b) {return b.score-a.score});
        bestLander = level.landers[0];
        if (times % 2 == 0) {
            level.drawLanders();
            console.log(bestLander.score + " in " + bestLander.timestep + " steps");
        }

        // Run again
        setTimeout(run, 50); // TODO 2 Euro an Rafael
    }

    // Define buttons
    document.getElementById("run1").onclick = function() {
        times = 1;
        run();
    }
    document.getElementById("run").onclick = function() {
        times = 1000 * 1000;
        run();
    }
    document.getElementById("pause").onclick = function() {
        times = 0;
    }
});