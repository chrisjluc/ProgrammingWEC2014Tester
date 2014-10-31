import sys, json, random, math

class RequestBuilder:

    def __init__(self, name, numRequests):
        self.name = name;
        self.numRequests = numRequests

    def is_not_street(self, coord):
        return self.map[coord[0]][coord[1]] != " "

    def gen_single_random_coord(self):
        x = int(math.floor(random.random() * self.width))
        y = int(math.floor(random.random() * self.height))
        return (x, y)

    def gen(self):
        mapName = "test/map" + self.name + ".txt"
        output = {}

        with open(mapName, "r") as mapText:
            self.map = mapText.read().split("\n")
            self.height = len(self.map)
            self.width = len(self.map[0])

            # Find taxi start
            for i in range(0, self.height):
                for j in range(0, self.width):
                    '''if self.map[i][j] not in " XT":
                        if self.map[i][j] in coordinates.keys():
                            print self.map[i][j], self.name
                            print "This is not supposed to happen"
                            return;

                        coord = {}
                        coord["y"] = i
                        coord["x"] = j
                        coord["symbol"] = self.map[i][j]
                        coordinates[self.map[i][j]] = coord'''
                    if self.map[i][j] == "T":
                        taxiStart = {}
                        taxiStart["y"] = i
                        taxiStart["x"] = j
                        output["taxiHeadquarter"] = taxiStart
                else:
                    continue
                break

            output["requests"] = []
            # Generate random paths
            for i in range(0, self.numRequests):
                request = {};
                request["id"] = i + 1

                pickup = self.gen_single_random_coord()
                dropoff = self.gen_single_random_coord()

                while(self.is_not_street(pickup)):
                    pickup = self.gen_single_random_coord()
                while(self.is_not_street(dropoff) or pickup == dropoff):
                    dropoff = self.gen_single_random_coord()

                request["pickup"] = {}
                request["dropoff"] = {}
                request["pickup"]["x"] = pickup[0]
                request["pickup"]["y"] = pickup[1]
                request["dropoff"]["x"] = dropoff[0]
                request["dropoff"]["y"] = dropoff[1]
                output["requests"].append(request)

        '''
        # Gets all keys that are between 65 and 90 ASCII, so all CAPITAL
        start = filter(lambda x: ord(x) >= 65 and ord(x) <= 90, coordinates.keys())
        # Gets all the lower case based on the start keys
        end = map(lambda x: chr(ord(x) + 32), start)


        for i in start:
            request = {}
            request["start"] = coordinates[i]
            request["destination"] = coordinates[chr(ord(i) + 32)]
            output["requests"].append(request)
        '''
        result = json.dumps(output, indent=4, separators=(',', ': '))
        outputFile = open("test/coord"+self.name+".txt", "w")
        outputFile.write(result)

if __name__ == "__main__":
    # size = sys.argv[1]
    sizes = ["8", "20", "60", "100", "200", "400"]
    requestNums = [2, 4, 8, 20, 20, 20]
    index = 0;
    for i in sizes:
        for j in range(1, 4):
            builder = RequestBuilder(i+"_"+str(j), requestNums[index]);
            builder.gen()
        index+=1
