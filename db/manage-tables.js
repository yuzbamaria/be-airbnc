const db = require("./connection.js");
const { 
    createUsersTable,
    createPropertyTypesTable,
    createPropertiesTable, 
    createFavouritesTable,
    createReviewsTable
 } = require("./create-tables.js");

async function manageTables() {

    // DROP TABLES
    await db.query(`DROP TABLE IF EXISTS reviews;`);
    await db.query(`DROP TABLE IF EXISTS favourites;`);
    await db.query(`DROP TABLE IF EXISTS properties;`);
    await db.query(`DROP TABLE IF EXISTS building_types;`);
    await db.query(`DROP TABLE IF EXISTS users;`);
    // await Promise.all([
    //     db.query(`DROP TABLE IF EXISTS building_types;`),
    //     db.query(`DROP TABLE IF EXISTS users;`)
    // ]);

    // CREATE TABLES 
    await Promise.all([
        db.query(createUsersTable),
        db.query(createPropertyTypesTable)
    ]);
    await db.query(createPropertiesTable);
    await db.query(createFavouritesTable);
    await db.query(createReviewsTable);
};

// async function run() {
//     try {
//         await manageTables();  
//         console.log("Table created successfully.");
//     } catch (err) {
//         console.error("Error creating table:", err);
//     }
// }

// run();
module.exports = manageTables;


