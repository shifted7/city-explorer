DROP TABLE IF EXISTS locations, forecasts, trails;

CREATE TABLE locations(
    id SERIAL PRIMARY KEY, 
    search_query VARCHAR(255), 
    formatted_query VARCHAR(255), 
    latitude VARCHAR(255), 
    longitude VARCHAR(255)
    );

CREATE TABLE forecasts(
    id SERIAL PRIMARY KEY, 
    latitude VARCHAR(255),
    longitude VARCHAR(255),
    forecast VARCHAR(255), 
    time VARCHAR(255), 
    retrieved VARCHAR(255)
    );

CREATE TABLE trails();


SELECT * FROM locations;
SELECT * FROM forecasts;