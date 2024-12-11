const db = require("./connection.js");
const { 
    createUsersTable,
    createPropertyTypesTable,
    createPropertiesTable, 
    createFavouritesTable,
    createReviewsTable, 
    createImagesTable,
    createBookingsTable
 } = require("./create-tables.js");

async function manageTables() {

    // DROP TABLES
    await db.query(`DROP TABLE IF EXISTS bookings;`);
    await db.query(`DROP TABLE IF EXISTS reviews;`);
    await db.query(`DROP TABLE IF EXISTS images;`)
    await db.query(`DROP TABLE IF EXISTS favourites;`);
    await db.query(`DROP TABLE IF EXISTS properties;`);
    await Promise.all([
        db.query(`DROP TABLE IF EXISTS property_types;`),
        db.query(`DROP TABLE IF EXISTS users;`)
    ]);

    // CREATE TABLES 
    await Promise.all([
        db.query(createUsersTable),
        db.query(createPropertyTypesTable)
    ]);
    await db.query(createPropertiesTable);
    await db.query(createFavouritesTable);
    await db.query(createReviewsTable);
    await db.query(createImagesTable);
    await db.query(createBookingsTable);
};

module.exports = manageTables;


