# Is My District Gerrymandered?

This is a project that estimates how likely a congressional district is gerrymandered based on its geographical compactness, voter wastage, and redistricting control. It was last updated for the 115th US Congressional districts (2016 election).

**TO-DO**: ADD LINK + SCREENSHOT.

### How does it work?

This project generates a "Gerrymander score" (from 0 to 100) for each of the 435 US congressional districts (The higher the score, the more gerrymandered it is). It calculates this score based on 3 factors:

1. **Geographical Compactness**: Basically, how compact is the district? It is more likely that a district is gerrymandered if it has an odd shape and a lot of small tendrils than if it is more regular. Geographical compactness is calculated using the *Polsby-Popper method*: dividing the area of the district by the area of a circle with the same perimeter.

2. **Voter Wastage**: Gerrymandering can essentially be done in two ways: "Packing", which crams all the voters of one party into a few districts to eliminate a majority, or "Cracking", which spreads the voters of one party into a lot of districts so they don't have a majority in any district. By calculating the number of wasted votes (the number of votes above the threshold to win, and all the votes of the losing party) for each party, we can determine if there is are more votes wasted for a specific party, a good indicator of partisan gerrymandering.

3. **Redistricting Control**: How are district lines drawn by state? In most states, the state legislatures, or other elected officials primarily draw district lines. This can potentially be biased, as members of one party will be drawing the district lines which can influence the election of members of their own party. Some state legislatures split redistricting control between both parties, mitigating some amount of partisan bias. Even better, a few states use independent, bipartisan commissions to draw district lines. Thus, how likely a redistricting process is to be biased is factored into the "gerrymander score".  

### Table of Contents

*   index.js: the main file which hosts the webserver.
*   views/: all of the webpages stored here.
*   public/: all of the frontend code is stored here.
*   data/:
  * raw/: all of the raw data is stored here
  * generate_csv.js: This file generates the master.csv, which contains all the data, for all the districts.
  * generate_efficiency.js: This file generates efficiency.csv, which contains information on voter wastage.
  * generate_geographical_compactness.js: This file generates compactness.csv, which contains the Polsby-Popper score for each district.

### Disclaimer

This project was created solely out of curiosity: I had heard a lot about partisan gerrymandering, and wanted to know if my district could be gerrymandered. It was not created out of political reasons: The project does not support any one party, but just displays the data collected. In the spirit of transparency, all of the source code used for this project is in this repository, and all of the datasets used are listed below.

### Issues?

Please submit an issue, or contact me at jshen@andover.edu if you believe you have found an error with this tool.

## Credits

This project was written by Jeffrey Shen, a current student at Phillips Academy. I received some assistance from Varun Roy and Bill Qin.

### Datasets used

*   **[github.com/unitedstates/districts](https://github.com/unitedstates/districts)**: Used to get the geojson files of each district.
*   **[history.house.gov](http://history.house.gov/Institution/Election-Statistics/Election-Statistics/)**: Used for house election data.
*   **[redistricting.lls.edu/who.php](http://redistricting.lls.edu/who.php)**: Used for information on redistricting by state.

### Built With

*   **turf-line-distance** and **geojson-area**: Used to calculate geographical compactness.
*   **Leaflet** and **Mapbox**: Used to display a map of each congressional district.
*   **Geocoder**: Used for converting an address into longitude and latitude, so it can later be converted into a congressional district.

### General Sources
These were all the articles, books, etc. that I read to better help me understand gerrymandering:

*   [“How the New Math of Gerrymandering Works.”](https://www.nytimes.com/interactive/2017/10/03/upshot/how-the-new-math-of-gerrymandering-works-supreme-court.html)
*   [“Compactness in Redistricting.”](http://www.theseventhstate.com/?tag=polsby-popper)
*   [“We have a standard for judging partisan gerrymandering. The Supreme Court should use it.”](https://www.washingtonpost.com/news/monkey-cage/wp/2017/02/02/       we-have-a-standard-for-judging-partisan-gerrymandering-the-supreme-court-should-use-it/?utm_term=.6d7324399dee)
*   [“How the Efficiency Gap Works.”](https://www.brennancenter.org/sites/default/files/legal-work/How_the_Efficiency_Gap_Standard_Works.pdf)
*   [Partisan Gerrymandering and the Efficiency Gap.”](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2457468)

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details