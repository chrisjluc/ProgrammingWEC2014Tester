from enum import Enum

class Element(Enum):
    STREET = " "
    BUILDING = "X"
    PERSON = 2

def format_block(element_enum):
    if element_enum == Element.STREET:
        return " "
    elif element_enum == Element.BUILDING:
        return "X"
    elif element_enum == Element.PERSON:
        return "2"
    else:
        return element_enum
