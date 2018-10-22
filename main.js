define([
    "libs/d3.min",
    "helper",
    "lander",
    "level",
    "test"
], function(d3, Helper, Lander, Level, Test) {

    // Test all the things
    Test.run();

    var NUMBER_OF_LANDERS = 200;
    var NUMBER_OF_POPULATIONS = 5;
    var MIX_POPULATION_CHANCE = 0.01;
    var REPRODUCING_LANDERS = 5;  // Per population
    var MAX_TIMESTEP = 300;

    var LANDERS_IN_POPULATION = Math.floor(NUMBER_OF_LANDERS / NUMBER_OF_POPULATIONS)

    var leveldata = {
        "Stalagtite": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "15",
            "0 2500", "100 200", "500 150",
            "1000 2000", "2000 2000", // Landing area
            "2010 1500", "2200 800", "2500 200",
            "6899 300", "6999 2500", "4100 2600",
            "4200 1000", "3500 800", "3100 1100", // Stalagtite
            "3400 2900",

            // Lander config
            "6500 1300 0 50 1750 0 0"
        ],
        "Stalagtite Top Right": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "15",
            "0 2500", "100 200", "500 150",
            "1000 2000", "2000 2000", // Landing area
            "2010 1500", "2200 800", "2500 200",
            "6899 300", "6999 2500", "4100 2600",
            "4200 1000", "3500 800", "3100 1100", // Stalagtite
            "3400 2900",

            // Lander config
            "4500 2300 20 -15 1750 0 0"
        ],
        "Cave": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "11",
            "0 2500", "100 1000", "2000 800",
            "2100 100", "3100 100", // Landing area
            "3200 1500", "1500 1600", "1500 1800",
            "4000 1700", "4100 100", "6999 200",

            //Lander config
            "6800 1500 0 -15 1750 0 0"
        ],
        "Cave from bottom": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "11",
            "0 2500", "100 1000", "2000 800",
            "2100 100", "3100 100", // Landing area
            "3200 1500", "1500 1600", "1500 1800",
            "4000 1700", "4100 100", "6999 200",

            //Lander config
            "4200 300 10 20 1750 0 0"
        ],
        "Cave horizontal": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "11",
            "0 2500", "100 1000", "2000 800",
            "2100 100", "3100 100", // Landing area
            "3200 1500", "1500 1600", "1500 1800",
            "4000 1700", "4100 100", "6999 200",

            //Lander config
            "6000 2500 40 0 1750 0 0"
        ]/*,
        "Level 3": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "7",
            "0 100", "1000 500", "1500 1500", "3000 1000",
            "4000 150", "5500 150", "6999 800",
            "2500 2700 0 0 550 0 0"
        ],
        "Level 4": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "10",
            "0 100", "1000 500", "1500 100", "3000 100", "3500 500",
            "3700 200", "5000 1500", "5800 300", "6000 1000", "6999 2000",
            "6500 2800 -100 0 600 90 0"
        ],
        "Level 5": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "7",
            "0 100", "1000 500", "1500 1500", "3000 1000",
            "4000 150", "5500 150", "6999 800",
            "2500 2700 0 0 550 0 0"
        ]*/
    }

    // Load and draw first level
    var firstlevelname = Object.keys(leveldata)[0];
    var firstleveldata = leveldata[firstlevelname]
    var level = Object.create(Level).init(firstleveldata);
    level.drawTerrain();
    var times = 0;  // How many more times we should run
    var bestLander = null;

    // Fill the level select combo box with options
    select = document.getElementById('levelselect');
    for (var name in leveldata) {
        if (!leveldata.hasOwnProperty(name)) {
            continue;
        }
        var opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name;
        select.appendChild(opt);
    }
    select.onchange = function() {
        times = 0;
        bestLander = null;
        level = Object.create(Level).init(leveldata[this.value]);
        level.drawTerrain();
    }

    // How things are run here
    var run = function() {

        // Anchor condition
        if (times <= 0) {
            console.log(bestLander)
            if (bestLander != null) {
                bestLander.printActualCommands();
            }
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

        // or evolve existing landers
        else {
            // Evolve each population independently
            for (var p = 0; p < NUMBER_OF_POPULATIONS; p++) {
                for (var i = REPRODUCING_LANDERS; i < LANDERS_IN_POPULATION; i++) {
                    // Replace each low-value lander with a combination of two high-value landers
                    combinationCount = REPRODUCING_LANDERS * (REPRODUCING_LANDERS - 1)
                    combination = (i - REPRODUCING_LANDERS) % combinationCount
                    var momIndex = Math.floor(combination / (REPRODUCING_LANDERS - 1));  // The "row"
                    var dadIndex = combination % (REPRODUCING_LANDERS - 1);  // The "col"
                    if (momIndex <= dadIndex) {
                        // Indexes have to be different
                        dadIndex += 1
                    }
                    var populationOffset = p * LANDERS_IN_POPULATION
                    level.landers[populationOffset + i].inheritCommands(
                        level.landers[populationOffset + momIndex],
                        level.landers[populationOffset + dadIndex]
                    );
                }
            }

            // Maybe mix two populations
            combinationCount = NUMBER_OF_POPULATIONS * (NUMBER_OF_POPULATIONS - 1)
            for (var combination = 0; combination < combinationCount; combination++) {
                if (Math.random() < MIX_POPULATION_CHANCE) {
                    var p1 = Math.floor(combination / (NUMBER_OF_POPULATIONS - 1))
                    var p2 = combination % (NUMBER_OF_POPULATIONS - 1)

                    // Have a child from the two best landers and place it randomly
                    childIndex = Helper.getRandomInt(p1 * LANDERS_IN_POPULATION + REPRODUCING_LANDERS, (p1 + 1) * LANDERS_IN_POPULATION - 1)
                    level.landers[childIndex].inheritCommands(
                        level.landers[p1 * LANDERS_IN_POPULATION],
                        level.landers[p2 * LANDERS_IN_POPULATION]
                    )
                }
            }

            // Reset the state of all landers
            for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
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

        // Sort landers by population and score
        populations = []
        for (var p = 0; p < NUMBER_OF_POPULATIONS; p++) {
            populations.push(level.landers.slice(p*LANDERS_IN_POPULATION, (p+1)*LANDERS_IN_POPULATION))
            populations[p] = populations[p].sort(function(a, b) {return b.score-a.score});
        }
        level.landers = [].concat(...populations.sort(function(a, b) {return b[0].score-a[0].score}));
        bestLander = level.landers[0];

        // Update screen
        if (times % 4 == 0) {
            level.drawLanders();
            console.log("Best score: " + bestLander.score);
            if (bestLander.timestep === MAX_TIMESTEP) {
                //console.log("MAX_TIMESTEP reached, maybe increase?")
            }
        }

        // Run again
        setTimeout(run, 0);
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
