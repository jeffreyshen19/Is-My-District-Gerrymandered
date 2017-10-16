import geojson
import numpy

def area(points):
    n = len(points)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
    area = abs(area) / 2.0
    return area

def perimeter(points):
    n = len(points)
    perim = 0.0
    for i in range(n):
        j = (i + 1) % n
        perimeter += numpy.sqrt((points[i][0] - points[j][0])**2 + (points[i][1] - points[j][1])**2)
    return perim

def convex_hull_points(points):
    # Sort the points
    points = sorted(set(points))

    if len(points) <= 1:
        return points

    # 2D cross product of OA and OB vectors
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    # Build lower hull
    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)

    # Build upper hull
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)

    return lower[:-1] + upper[:-1]

def convex_hull(points):
    area = 0.0
    convex_hull_area = 0.0

    # Sort the points
    points = sorted(set(points))

    if len(points) <= 1:
        return 0

    area = area(points)
    convex_hull_area = area(convex_hull_points(points))

    return area/convex_hull_area

def polsby_popper(points):
    perimeter = 0.0
    area = 0.0

    # Sort the points
    points = sorted(set(points))

    if len(points) <= 1:
        return 0

    area = area(points)
    perimeter = perimeter(points)

    return area*4*numpy.pi/(perimeter**2)

def reock(points):
    # Sort the points
    points = sorted(set(points))

    if len(points) <= 1:
        return points
