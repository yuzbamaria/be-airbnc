exports.createUsersTable = `CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR,
    surname VARCHAR,
    email VARCHAR NOT NULL UNIQUE,
    phone_number VARCHAR,
    role VARCHAR DEFAULT 'guest' CHECK (role IN ('host', 'guest')),
    avatar VARCHAR, 
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

exports.createPropertyTypesTable = `CREATE TABLE property_types (
    property_type VARCHAR NOT NULL PRIMARY KEY,
    description TEXT NOT NULL);`;

exports.createPropertiesTable = `CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    host_id INT NOT NULL REFERENCES users(user_id),
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    property_type VARCHAR NOT NULL REFERENCES property_types(property_type),
    price_per_night DECIMAL NOT NULL, 
    description TEXT);`;  
    
exports.createFavouritesTable = `CREATE TABLE favourites (
    favourite_id SERIAL PRIMARY KEY,
    guest_id INT NOT NULL REFERENCES users(user_id),
    property_id INT NOT NULL REFERENCES properties(property_id));`;

exports.createReviewsTable = `CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(property_id),
    guest_id INT NOT NULL REFERENCES users(user_id),
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

exports.createImagesTable = `CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(property_id),
    image_url VARCHAR NOT NULL,
    alt_text VARCHAR NOT NULL);`;

exports.createBookingsTable = `CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(property_id),
    guest_id INT NOT NULL REFERENCES users(user_id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

    