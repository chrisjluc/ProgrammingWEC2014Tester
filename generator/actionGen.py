import sys, json

direction = {
    "l": (0, -1),
    "u": (-1, 0),
    "r": (0, 1),
    "d": (1, 0)
}

def main(filename, outputfilename):
    global direction
    map_text = None
    taxiCount = 1
    taxiActions = {}
    next_string = None

    while next_string != "done":
        actions = []
        next_string = None
        with open(filename, "r") as mapFile:
            map_text = mapFile.read().split("\n")

        x, y = get_start(map_text, actions)

        while next_string != "next" and next_string != "done":
            print_map(map_text)
            next_string = input()
            if next_string in direction.keys():
                shift = direction[next_string]

                row = list(map_text[y])
                row[x] = ' ' 
                map_text[y] = "".join(row)

                x = shift[1] + x
                y = shift[0] + y

                row = list(map_text[y])
                row[x] = 'T'
                map_text[y] = "".join(row)
                add_drive(x, y, actions)

            elif next_string == "pi" or next_string == "dr":
                add_action(next_string, actions)
        taxiActions["taxi" + str(taxiCount)] = actions
        taxiCount+=1
    output = json.dumps(taxiActions, indent=4, separators=(',', ': '))
    outputfile = open(outputfilename, "w")
    outputfile.write(output)
    return

def add_action(action, actions):
    i = {}
    if action == 'pi':
        i["action"] = 'pickup'
    elif action == 'dr':
        i["action"] = 'dropoff'

    actions.append(i)


def add_drive(x, y, actions):
    i = {}
    i["action"] = "drive"
    i["x"] = x
    i["y"] = y
    actions.append(i)

def get_start(map_text, actions):
    for i in range(0, len(map_text)):
        row = map_text[i]
        for j in range(0, len(row)):
            if row[j] == "T":
                o = {}
                o["action"] = "start"
                o["x"] = j
                o["y"] = i
                actions.append(o)
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
