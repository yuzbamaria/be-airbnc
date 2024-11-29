// const { on } = require("supertest/lib/test");
const db = require("../db/connection");
const { lookUpHosts, mapHostKey, orderProperties } = require("./utils");

exports.fetchProperties = async() => {
    const queryStr = `SELECT
            properties.property_id,
            properties.name,
            properties.location,
            properties.price_per_night,
            properties.host_id,
            users.first_name,
            users.surname
        FROM properties
        JOIN users ON
            properties.host_id = users.user_id
        LEFT JOIN favourites ON
            properties.property_id = favourites.property_id
        GROUP BY
            properties.property_id,
            users.first_name,
            users.surname
        ORDER BY
            COUNT(favourites.favourite_id) DESC
        ;`;

    const { rows } = await db.query(queryStr);
    const hostsRef = lookUpHosts(rows);
    const updatedHostKeyProperties = mapHostKey(hostsRef, "host_id", "host", rows);
    const orderedProperties = orderProperties(updatedHostKeyProperties);

    return { properties: orderedProperties };
};