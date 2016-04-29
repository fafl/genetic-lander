define([
    "d3.min",
    "lander",
    "level"
], function(d3, Lander, Level) {

    var NUMBER_OF_LANDERS = 100;
    var MAX_TIMESTEP = 100;

    var level1data = [
        "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
        "8",
        "0 2500", "100 200", "500 150", "1000 400", "2000 400",
        "2100 10", "6899 300", "6999 2500",
        "6000 2500 30 -10 1750 0 0"
    ]

    // Load level
    var level = Object.create(Level).init(level1data);
    level.drawTerrain();

    // How things are run here
    var bestLander = null;
    var times = 0;
    var run = function() {
        if (times <= 0) {
            console.log(bestLander)
            return
        }
        times -= 1;

        // Create landers
        level.landers = [];
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            level.landers.push(
                Object.create(Lander)
                    .init(level.defaultLanderFields)
            )
        }

        // Create commands for each lander
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            if (bestLander == null) {
                level.landers[i].createRandomCommands(MAX_TIMESTEP)
            }
            else {
                // Copy from best and mutate
                level.landers[i].copyCommandsAndMutate(bestLander, MAX_TIMESTEP);
            }
        }

        // Best lander may live
        // TODO best n landers
        if (bestLander != null) {
            level.landers[0] = bestLander;
        }

        // Fly you fools
        for (var t = 0; t < MAX_TIMESTEP; t++) {
            for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
                var lander = level.landers[i]

                // Set next command
                lander.angle = lander.commands[t][0];
                lander.power = lander.commands[t][1];
            }
            level.tick();
        }

        // Find best lander
        bestLander = level.landers.sort(function(a,b) {return b.score-a.score})[0];
        if (times % 10 == 0) {
            level.drawLanders();
            console.log(bestLander.score);
        }

        // Run again
        setTimeout(run, 1);
    }

    // Define buttons
    document.getElementById("run1").onclick = function() {
        times = 1;
        run();
    }
    document.getElementById("run").onclick = function() {
        times = 10000;
        run();
    }
    document.getElementById("stop").onclick = function() {
        times = 0;
    }
});