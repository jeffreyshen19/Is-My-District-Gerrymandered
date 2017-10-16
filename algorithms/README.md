## Algorithms for Measuring Geographic Compactness

* Roeck
 - Find the smallest circle containing the district and take the ratio of the district area to that of a circle. This ratio is always between 0 and 1; the closer it is to 1, the more compact is the district.
* Convex Hull
 - Find the smallest convex polygon containing the district and take the ratio of the district area to that of a circle. This ratio is always between 0 and 1; the closer it is to 1, the more compact is the district.
* Polsby-Popper
 - Find the perimeter of the district and construct a circle with the same perimeter. the ratio between the area of the district and the circle is always between 0 and 1; the closer it is to 1, the more compact is the district.
* Boyce-Clark
  - Determine the center of gravity of the district and measure the distance from the center to the outside edges of the district along equally spaced radial lines. Compute the percentage by which each of the radial distance differs from the average radial distance, and find the average percentage deviations over all radial. The closer the result is to 0, the more compact a district is.
* Length/Width
 - Find a rectangle enclosing the district and touching it on all four sides, such that the ratio of the length to the width is a maximum. The closer the ratio is to 1, the more compact is the district.

**Notes**
* Factor in Border

*Credits:
http://rangevoting.org/YoungCompactness.pdf
