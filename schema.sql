DROP TABLE IF EXISTS locations, weather, trails;

CREATE TABLE locations(id SERIAL PRIMARY KEY, search_query VARCHAR(255), formatted_query VARCHAR(255), latitude VARCHAR(255), longitude VARCHAR(255));

SELECT * FROM locations;
