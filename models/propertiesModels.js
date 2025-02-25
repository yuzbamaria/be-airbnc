const db = require("../db/connection");
const { lookUpHosts, mapHostKey, orderProperties } = require("./utilsForModels");

exports.fetchProperties = async(sort = "popularity", order = "desc", host, maxprice, minprice) => {

    const validSortOptions = [
        "popularity", 
        "cost_per_night"
    ];

    const validOrderOptions = ["asc", "desc"];

    if (!validSortOptions.includes(sort) ||
        !validOrderOptions.includes(order)   
    ) {
        return Promise.reject({ status: 404, msg: "Path not found." }); // handlePathNotFound, 404
    };

    let queryStr = `SELECT 
            properties.property_id,
            properties.name,
            properties.location,
            properties.price_per_night::int AS cost_per_night,
            properties.host_id,
            users.first_name,
            users.surname,
            COUNT(favourites.favourite_id) AS popularity,
            MIN(images.image_url) AS image
        FROM properties
        JOIN users ON
            properties.host_id = users.user_id
        LEFT JOIN favourites ON
            properties.property_id = favourites.property_id
        JOIN images ON
            properties.property_id = images.property_id `;

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
            params.push(maxprice);
        };
        if(minprice) {
            maxMinOptions.push(`price_per_night >= $${params.length + 1}`);
            params.push(minprice);
        }
        queryStr += maxMinOptions.join(" AND ");
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
// this.fetchProperties("popularity", "desc", 1, 500, 100).then((result) => console.log(result.properties.length))

async function fetchFavouriteByUser(property_id, guest_id) {
    const queryStr = `
        SELECT * 
        FROM favourites
        WHERE property_id = $1 AND guest_id = $2`;
    const {rows} = await db.query(queryStr, [property_id, guest_id]);
    return rows;
};

async function fetchAllImagesById(property_id) {
    const queryStr = `
        SELECT 
            images.image_url as image
        FROM properties
        JOIN users ON 
            properties.host_id = users.user_id
        JOIN images ON 
            properties.property_id = images.property_id
        WHERE properties.property_id = $1;`
    const { rows } = await db.query(queryStr, [property_id]);
    return rows;
};

exports.fetchProperty = async(property_id, user_id) => {
    let queryStr = `
        SELECT
            properties.property_id,
            properties.name as property_name, 
            properties.location,
            properties.price_per_night,
            properties.description,
            CONCAT(users.first_name, ' ', users.surname) as host,
            users.avatar as host_avatar,
            COUNT(favourites.favourite_id) as favourite_count,
            images.image_url as images
        FROM properties
        JOIN users ON 
            properties.host_id = users.user_id
        LEFT JOIN favourites ON
            properties.property_id = favourites.property_id
        JOIN images ON 
            properties.property_id = images.property_id
        WHERE properties.property_id = $1`;
    
    let favourited;
    const params = [property_id];

    if(user_id) {
        queryStr += ` AND favourites.guest_id = $2`;
        params.push(user_id);
        const favourites = await fetchFavouriteByUser(property_id, user_id);
        if (favourites.length > 0) {
            favourited = true;
        };
    };

    queryStr += `GROUP BY 
        properties.property_id, 
        users.first_name, 
        users.surname, 
        users.avatar,
        images.image_url;`;

    const { rows } = await db.query(queryStr, params);
    if(rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Resource not found." })
    };
    
    const property = rows[0];
    if (user_id) {
        property.favourited = favourited;
    };
    
    const allImages = await fetchAllImagesById(property_id);
    property.images = allImages;
 
    return { property: property };
};



