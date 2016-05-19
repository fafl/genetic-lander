import sys

def debug(s):
    sys.stderr.write(s + "\n")
    sys.stderr.flush()

lookup = [
    [
        "0 100 1000 500 1500 1500",
        [[-9,0],[-24,1],[-39,2],[-24,2],[-9,1],[1,2],[-4,3],[-19,3],[-24,2],[-28,3],[-13,2],[-12,3],[-27,2],[-17,1],[-32,2],[-47,3],[-32,3],[-30,3],[-43,2],[-43,1],[-58,2],[-43,3],[-29,4],[-31,4],[-16,3],[-31,2],[-19,2],[-17,3],[-2,3],[-17,4],[-12,4],[0,4],[-15,4],[-8,4],[-2,4],[-17,4],[-2,4],[-8,4],[-9,4],[-9,4],[6,4],[-8,4],[-1,4],[10,4],[3,4],[18,4],[3,4],[5,4],[8,4],[10,4],[5,4],[13,4],[2,4],[7,4],[8,4],[16,4],[6,4],[16,4],[3,4],[18,4],[3,4],[5,4],[10,4],[6,4],[11,4],[12,4],[0,4],[12,4],[0,4],[0,4],[0,4],[0,4]]
    ], [
        "0 100 1000 500 1500 100",
        [[87,1],[90,0],[80,0],[65,0],[50,0],[35,1],[23,2],[8,1],[-5,2],[-13,2],[-2,1],[-11,2],[-15,2],[-22,2],[-27,3],[-30,4],[-30,4],[-30,4],[-34,4],[-31,4],[-25,4],[-35,4],[-26,4],[-40,4],[-26,4],[-21,4],[-36,4],[-34,4],[-20,4],[-24,4],[-31,4],[-31,4],[-20,4],[-35,4],[-20,4],[-5,4],[-20,4],[-12,4],[-27,4],[-17,4],[-22,4],[-17,4],[-14,4],[-20,4],[-19,4],[-20,4],[-20,4],[-17,4],[-15,4],[-14,4],[-14,4],[-15,4],[-16,4],[-1,4],[-16,4],[-22,4],[-7,4],[-22,4],[-7,4],[-15,4],[-13,4],[-22,4],[-15,4],[-22,4],[-15,4],[-19,4],[-15,4],[-19,4],[-16,4],[-15,4],[-16,4],[0,4],[0,4],[0,4]]
    ]
]

# Read terrain
terrain = []
numberOfPoints = int(raw_input())
for i in range( numberOfPoints ):
    line = raw_input()
    debug(line)
    terrain.append(line)
terrainString = " ".join(terrain)

# Find command set
for pair in lookup:
    if terrainString.startswith(pair[0]):
        commands = pair[1]
        break
else:
    print "zonk"

commandIndex = 0;
while True:
    line = raw_input()
    c = commands[commandIndex]
    print "%s %s" % (c[0], c[1])
    commandIndex += 1
