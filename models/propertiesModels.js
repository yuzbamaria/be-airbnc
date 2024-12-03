const db = require("../db/connection");
const { lookUpHosts, mapHostKey, orderProperties } = require("./utilsForModels");

const fetchProperties = async(sort, order, host) => {

    let queryStr = `SELECT
            properties.property_id,
            properties.name,
            properties.location,
            properties.price_per_night::int AS cost_per_night,
            properties.host_id,
            users.first_name,
            users.surname,
            COUNT(favourites.favourite_id) as popularity
        FROM properties
        JOIN users ON
            properties.host_id = users.user_id
        LEFT JOIN favourites ON
            properties.property_id = favourites.property_id `;

    const params = [];
    if (host) {
        host = Number(host);
        queryStr += `WHERE host_id = $1 `;
        params.push(host);
    };

    queryStr += `GROUP BY
            properties.property_id,
            users.first_name,
            users.surname `;

    queryStr += `ORDER BY ${sort} ${order};`;

    const { rows } = await db.query(queryStr, params);
    const hostsRef = lookUpHosts(rows);
    const updatedHostKeyProperties = mapHostKey(hostsRef, "host_id", "host", rows);
    const orderedProperties = orderProperties(updatedHostKeyProperties);

    return { properties: orderedProperties };
};
// fetchProperties(undefined, undefined, 1).then((result) => console.log(result))

module.exports = fetchProperties;