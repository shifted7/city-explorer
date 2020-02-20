DROP TABLE IF EXISTS locations, weather, trails;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude VARCHAR(30),
    longitude VARCHAR(30)
);

-- INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ('Seattle', 'Seattle, King County, Washington, USA', '12', '12');
-- INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ('Test', 'Test city, WA', '12', '12');

SELECT * FROM locations;
