define([
    "d3.min",
    "helper",
    "lander",
    "level"
], function(d3, Helper, Lander, Level) {

    var level1data = [
        "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
        "9",
        "0 2500", "100 100", "500 50", "1000 300", "2000 300",
        "2100 10", "6500 250", "6899 200", "6999 2500",
        "4000 2000 0 0 9750 0 0"
    ]

    // Load level
    var level = Object.create(Level).init(level1data);
    
    // Create landers
    var NUMBER_OF_LANDERS = 100;
    for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
        level.landers.push(
            Object.create(Lander)
                .init(level.defaultLanderFields)
                .setColor(Helper.rainbow(NUMBER_OF_LANDERS * 5, i))
                .createRandomCommands(100)
        )
    }

    // Fly you fools
    for (var t = 0; t < 100; t++) {
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
    level.draw();
});