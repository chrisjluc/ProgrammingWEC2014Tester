import sys, json

def main(name):
    mapName = "test/map" + name + ".txt"
    coordinates = {}
    taxiStart = {}
    with open(mapName, "r") as mapText:
        mapText = mapText.read().split("\n")
        for i in range(0, len(mapText)):
            for j in range(0, len(mapText[i])):
                if mapText[i][j] not in " XT":
                    if mapText[i][j] in coordinates.keys():
                        print mapText[i][j], name
                        print "This is not supposed to happen"
                        return;
                    coord = {}
                    coord["y"] = i
                    coord["x"] = j
                    coord["symbol"] = mapText[i][j]
                    coordinates[mapText[i][j]] = coord
                if mapText[i][j] == "T":
                    taxiStart["y"] = i
                    taxiStart["x"] = j
    start = filter(lambda x: ord(x) >= 65 and ord(x) <= 90, coordinates.keys())
    end = map(lambda x: chr(ord(x) + 32), start)
    output = {}
    output["requests"] = []
    output["taxi"] = taxiStart
    for i in start:
        request = {}
        request["start"] = coordinates[i]
        request["destination"] = coordinates[chr(ord(i) + 32)]
        output["requests"].append(request)
    result = json.dumps(output, indent=4, separators=(',', ': '))
    outputFile = open("test/coord"+name+".txt", "w")
    outputFile.write(result)

if __name__ == "__main__":
    # size = sys.argv[1]
    sizes = ["8", "20", "60", "100", "200", "400"]
    for i in sizes:
        for j in range(1, 4):
            main(i+"_"+str(j));
