define([
    "d3.min",
    "helper",
    "lander",
    "level"
], function(d3, Helper, Lander, Level) {

    var NUMBER_OF_LANDERS = 10;
    var MAX_TIMESTEP = 1000;

    var level1data = [
        "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
        "9",
        "0 2500", "100 200", "500 150", "1000 400", "2000 400",
        "2100 110", "6500 350", "6899 300", "6999 2500",
        "4000 2000 0 0 9750 0 0"
    ]

    // Load level
    var level = Object.create(Level).init(level1data);
    level.drawTerrain();
    
    // Create landers
    for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
        level.landers.push(
            Object.create(Lander)
                .init(level.defaultLanderFields)
                .setColor(Helper.rainbow(NUMBER_OF_LANDERS * 5, i))
                .createRandomCommands(MAX_TIMESTEP)
        )
    }

    // Fly you fools
    for (var t = 0; t < MAX_TIMESTEP; t++) {
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            var lander = level.landers[i]

            // Set next command
            lander.angle = lander.commands[t][0];
            lander.power = lander.commands[t][1];

            // Check if we crashed
            // TODO
        }
        level.tick();
    }
    level.drawLanders();

    var bestLander = level.landers.sort(function(a,b) {return b.score-a.score})[0];

    // blub

    console.log(level.landers.map(function (l) {return l.score}));
    console.log(bestLander);
});