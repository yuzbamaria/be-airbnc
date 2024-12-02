const db = require("../db/connection");
const { lookUpHosts, mapHostKey, orderProperties } = require("./utilsForModels");

const fetchProperties = async(sort = "favourites_count", order = "desc") => {

    const validSortOptions = [
        "favourites_count", 
        "cost_per_night"
    ];

    let queryStr = `SELECT
            properties.property_id,
            properties.name,
            properties.location,
            properties.price_per_night::int AS cost_per_night,
            properties.host_id,
            users.first_name,
            users.surname,
            COUNT(favourites.favourite_id) as favourites_count
        FROM properties
        JOIN users ON
            properties.host_id = users.user_id
        LEFT JOIN favourites ON
            properties.property_id = favourites.property_id
        GROUP BY
            properties.property_id,
            users.first_name,
            users.surname `;

    if (sort || order) {
        queryStr += `ORDER BY ${sort} ${order};`
    };

    const { rows } = await db.query(queryStr);
    const hostsRef = lookUpHosts(rows);
    const updatedHostKeyProperties = mapHostKey(hostsRef, "host_id", "host", rows);
    const orderedProperties = orderProperties(updatedHostKeyProperties);

    return { properties: orderedProperties };
};
// fetchProperties().then((result) => console.log(result))

module.exports = fetchProperties;