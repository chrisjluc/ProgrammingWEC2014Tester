import random, math, sys
from block_enum import Element, format_block

class CityMap:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.num_coord = int(math.sqrt(self.width * self.height))
        # Max street length is used for creating a + from the intersection
        self.max_street_length = math.sqrt(self.width) * 0
        self.maze = [[Element.BUILDING for x in range(self.height)]
                        for y in range(self.width)]

    def gen_map(self):
        """Creates a 2D array of the city based on the settings given"""
        self.maze = [[Element.BUILDING for x in range(self.height)]
                        for y in range(self.width)]
        random_coord = self.gen_random_coord()
        for coord in random_coord:
            x = coord[0]
            y = coord[1]
            self.maze[y][x] = Element.STREET


            # TODO: This code is shitty and repetitive, fix this
            # Append streets to top
            for i in range(1, y):
                if y-i < 0:
                    break
                elif self.maze[y-i][x] == Element.STREET:
                    break
                self.maze[y-i][x] = Element.STREET
                # Check left and right side
                if x-1 >= 0:
                    if self.maze[y-i][x-1] == Element.STREET:
                        break
                if x+1 < self.width:
                    if self.maze[y-i][x+1] == Element.STREET:
                        break

            # Append streets to the right
            for i in range(1, self.width-x-1):
                if x+i >= self.width:
                    break
                elif self.maze[y][x+i] == Element.STREET:
                    break
                self.maze[y][x+i] = Element.STREET
                if y-1 >= 0:
                    if self.maze[y-1][x+i] == Element.STREET:
                        break
                if y+1 < self.height:
                    if self.maze[y+1][x+i] == Element.STREET:
                        break

            # Append streets to the bottom
            for i in range(1, self.height-y-1):
                if y+i >= self.height:
                    break
                elif self.maze[y+i][x] == Element.STREET:
                    break
                self.maze[y+i][x] = Element.STREET
                # Check left and right side
                if x-1 >= 0:
                    if self.maze[y+i][x-1] == Element.STREET:
                        break
                if x+1 < self.width:
                    if self.maze[y+i][x+1] == Element.STREET:
                        break

            # Append streets to the left
            for i in range(1, x):
                if x-i < 0:
                    break
                elif self.maze[y][x-i] == Element.STREET:
                    break
                self.maze[y][x-i] = Element.STREET
                if y-1 >= 0:
                    if self.maze[y-1][x-i] == Element.STREET:
                        break
                if y+1 < self.height:
                    if self.maze[y+1][x-i] == Element.STREET:
                        break

        num = 0
        if self.width < 50:
            num = 2
        else:
            num = 8
        print num
        symbol = "A"
        for i in range(0, num):
            start_coord = (0, 0)
            end_coord = (0, 0)
            while start_coord == end_coord or self.is_not_street(start_coord) or self.is_not_street(end_coord):
                start_coord = self.gen_single_random_coord()
                end_coord = self.gen_single_random_coord()
            end_symbol = chr(ord(symbol) + 32)
            self.set_elem(start_coord, symbol)
            self.set_elem(end_coord, end_symbol)
            symbol = chr(ord(symbol) + 1)

        taxi_hq = (0, 0)
        while self.is_not_street(taxi_hq):
            taxi_hq = self.gen_single_random_coord()

        self.set_elem(taxi_hq, "T")

    def set_elem(self, pair, val):
        self.maze[pair[0]][pair[1]] = val

    def is_not_street(self, coord):
        return self.maze[coord[0]][coord[1]] != Element.STREET

    def gen_single_random_coord(self):
        x = int(math.floor(random.random() * self.width))
        y = int(math.floor(random.random() * self.height))
        return (x, y)

    def gen_random_coord(self):
        """Generates random coordinates on the map.

        These coordinates will be used to construct buildings
        within the city
        """
        big_block_coord = []
        if self.num_coord <= 1:
            raise Exception("City is too small")
        random_coord = []
        for i in range(0, self.num_coord):
            # Optimize this
            x = int(math.floor(random.random() * self.width / 4))
            y = int(math.floor(random.random() * self.height / 4))

            spot = int(math.floor(random.random() * 4))
            small_y = y * 4 + 1 + spot % 2
            small_x = x * 4 + 1 + spot / 2

            big_intersection = (x, y)
            small_intersection = (small_x, small_y)
            if big_intersection not in big_block_coord:
                big_block_coord.append(big_intersection)
                random_coord.append(small_intersection)

        return random_coord

    def to_string(self):
        result = []
        for row in self.maze:
            row = map(format_block, row)
            result.append("".join(row))
        return "\n".join(result)

    def print_city(self):
        print self.to_string()

    def print_coord(self):
        random_coord = self.gen_random_coord()
        for i in random_coord:
            print i

    def write_city(self, index):
        filename = "test/map" + str(self.width) + "_" + str(index) + ".txt"
        print filename
        with open(filename, "w") as txtfile:
            txtfile.write(self.to_string())

def main(size=60, mapcount=3):
    size = int(size)
    mapcount = int(mapcount)
    city = CityMap(size, size)
    for i in range(0, mapcount):
        city.gen_map()
        city.write_city(i+1)

if __name__ == "__main__":
    if len(sys.argv) == 3:
        main(sys.argv[1], sys.argv[2])
    elif len(sys.argv) == 2:
        main(sys.argv[1])
    else:
        sizes = [8, 20, 60, 100, 200, 400]
        for i in sizes:
            main(i)
