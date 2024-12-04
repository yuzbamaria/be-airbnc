const db = require("../db/connection");
const { lookUpHosts, mapHostKey, orderProperties } = require("./utilsForModels");

const fetchProperties = async(sort, order, host, maxprice, minprice) => {

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
    if(host) {
        queryStr += `WHERE host_id = $${params.length + 1} `;
        params.push(Number(host));
    };
    if(maxprice || minprice) {
        if(host) {
            queryStr += `AND `;
        } else {
            queryStr += `WHERE `;
        };

        const maxMinOptions = [];
        if(maxprice) {
            maxMinOptions.push(`price_per_night <= $${params.length + 1}`);
            params.push(Number(maxprice));
        };
        if(minprice) {
            maxMinOptions.push(`price_per_night >= $${params.length + 1}`);
            params.push(minprice);
        }
        queryStr += maxMinOptions;
    };

    queryStr += `GROUP BY
            properties.property_id,
            users.first_name,
            users.surname `;

    queryStr += `ORDER BY ${sort} ${order};`;

    const { rows } = await db.query(queryStr, params);

    if(rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Resource not found." })
    };
    const hostsRef = lookUpHosts(rows);
    const updatedHostKeyProperties = mapHostKey(hostsRef, "host_id", "host", rows);
    const orderedProperties = orderProperties(updatedHostKeyProperties);

    return { properties: orderedProperties };
};
// fetchProperties("popularity", "desc", 11111111, undefined, undefined).then((result) => console.log(result))

module.exports = fetchProperties;