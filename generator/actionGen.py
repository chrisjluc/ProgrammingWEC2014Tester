import sys, json

direction = {
    "l": (0, -1),
    "t": (-1, 0),
    "r": (0, 1),
    "d": (1, 0)
}

def main(filename, outputfilename):
    global direction
    map_text = None
    with open(filename, "r") as mapFile:
        map_text = mapFile.read().split("\n")
    x, y = get_start(map_text)
    # pickups = get_pickups(map_text)
    # destin = get_destinations(map_text)

    actions = []
    add_drive(x, y, actions)

    next_string = None
    while next_string != "done":
        print_map(map_text)
        next_string = input()
        if next_string in direction.keys():
            shift = direction[next_string]
            map_text[x][y] = " "
            x = shift[1] + x
            y = shift[0] + y
            map_text[y][x] = "T"
            add_drive(x, y, actions)
        elif next_string == "pickup" or next_string == "dropoff":
            add_action(next_string, actions)

    output = json.dumps(actions, indent=4, separators=(',', ': '))
    outputfile = open(outputfilename, "w")
    outputfile.write(output)
    return

def add_action(action, actions):
    i = {}
    i["action"] = action
    actions.append(i)


def add_drive(x, y, actions):
    i = {}
    i["action"] = "drive"
    i["x"] = x
    i["y"] = y
    actions.append(i)

def get_start(map_text):
    for i in range(0, len(map_text)):
        row = map_text[i]
        for j in range(0, len(row)):
            if row[j] == "T":
                return (j, i)

def print_map(map_text):
    print to_string(map_text)
    return

def to_string(map_text):
    return "\n".join(map_text)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print "Must enter a filename only"
    filename = sys.argv[1]
    outputname = sys.argv[2]
    main(filename, outputname)
