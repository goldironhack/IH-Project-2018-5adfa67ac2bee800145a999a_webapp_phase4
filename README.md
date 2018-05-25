## webapp_phase4

**Name:** _Housing Sniffer_
**Keywords:** _web app, __google maps, __dynamic_

**DataSets**
|Name  | Link | Data Type |data columns used |data amount|  
|--|--|--|--|--|
|Neighborhood Names GIS | 
https://catalog.data.gov/dataset/neighborhood-names-gis | LatLng | 1 | 299 |
|...|...|...| ...| ...|
|NY Districts geoshapes | http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson
 | GeoJson| a lot | 299 polygons |


- [] Do you use the primary dataset ”online climate data” from data.gov?

- [] Are all these datasets from data.gov or data.indy.gov? If not, where are they coming from (links)?
- http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson

**Introduction**

Housing Sniffer is a web app for finding the best living place in N.Y.C It is
built around the idea of helping students attending the N.Y.U Stern School of business, allowing them to search living places acording to several parameters (safety, distance to school, afforadbility, etc.)

Im not gonna lie. this is the exact same thing as phase 3. Im still working
in the data analysis. I hope to have all the requirements for the final phase.


Map View:

[Y] Basic Map with specific location (your map is located in a meaningful place, city of west lafayette for example)
[N] [describe] Any cover on the map (for example, cloud cover to show the weather effect)

Data Visualization:

[N] [describe] Use Graph? What is the type? (bar chart, pie chart, radar chart ...)
[N] [List] Any interaction available on the graph? List them (enable click on numbers, drag on lines, change time/variables ...)

Interaction Form:

[Y] [List] Any information output? list them. (text field, text area, label, plain HTML ...)
    * NYC district are showed as colored polygons. In this phase there are 3 colors (red, blue, green) and the polygons are painted acording to their ID.
[N] [List] Any operation option (filters)? List them. (search markets, search vegetables, filter based on price, sort based on convenience ...)
[N] [List] Any information input? List them. (comments, markers, user preference ...)
[N] [List] Interaction with Map? List them. (filter on price will affect map markers, sort on price will affect map markers, ...)
[N] [List] Interaction with data visualization? List them. (filter, sort, set variables ...)
Test Case Which browsers did you test your project on? Chrome, IE, Edge, Safari, or Firefox?
    * The app was tested on google chrome. 

Additional information You Want to Share with Us E.g. any problems you faced/fixed, where you reached out to for help, etc.
Making bootstrap to work was challenging. At the end I'm satisfied with what I achieved, but it was a bit frustrating. Google maps and JQuery are the most difficult things for me.
