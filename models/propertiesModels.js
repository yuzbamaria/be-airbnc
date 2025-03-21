const db = require("../db/connection");
const { lookUpHosts, mapHostKey } = require("./utilsForModels");

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

    const safeSort = validSortOptions.includes(sort) ? sort : "popularity";
    const safeOrder = validOrderOptions.includes(order) ? order : "desc";

    let queryStr = `SELECT 
            properties.property_id,
            properties.name as property_name,
            properties.location,
            properties.property_type,
            properties.price_per_night::int AS cost_per_night,
            properties.host_id,
            users.first_name,
            users.surname,
            COUNT(favourites.favourite_id) AS popularity,
            ARRAY_AGG(images.image_url) as images
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
            params.push(Number(maxprice));
        };
        if(minprice) {
            maxMinOptions.push(`price_per_night >= $${params.length + 1}`);
            params.push(Number(minprice));
        }
        queryStr += maxMinOptions.join(" AND ");
    };
    
    queryStr += ` GROUP BY
            properties.property_id,
            users.first_name,
            users.surname `;

    queryStr += `ORDER BY ${safeSort} ${safeOrder};`;

    const { rows } = await db.query(queryStr, params);

    if(rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Resource not found." })
    };

    const hostsRef = lookUpHosts(rows);
    const updatedProperties = mapHostKey(hostsRef, "host_id", "host", rows);
    return { properties: updatedProperties };
};

async function fetchFavouriteByUser(property_id, guest_id) {
    const queryStr = `
        SELECT * 
        FROM favourites
        WHERE property_id = $1 AND guest_id = $2`;
    const {rows} = await db.query(queryStr, [property_id, guest_id]);
    return rows;
};

exports.fetchProperty = async (property_id, user_id) => {
  try {
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
            ARRAY_AGG(images.image_url) as images
        FROM properties
        JOIN users ON 
            properties.host_id = users.user_id
        LEFT JOIN favourites ON
            properties.property_id = favourites.property_id
        JOIN images ON 
            properties.property_id = images.property_id
        WHERE properties.property_id = $1
        GROUP BY 
            properties.property_id, 
            users.first_name, 
            users.surname, 
            users.avatar;`;

    const params = [property_id];

    const { rows } = await db.query(queryStr, params);
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Resource not found." });
    }

    const property = rows[0];
    if (user_id) {
        const favourites = await fetchFavouriteByUser(property_id, user_id);
        property.favourited = favourites.length > 0;
      }
      return { property };
    } catch (err) {
      console.error(err);
    }
};

  exports.fetchFavouriteByUserModel = async (property_id, guest_id) => {
        try {
            const queryStr = `
                SELECT * 
                FROM favourites
                WHERE property_id = $1 AND guest_id = $2`;
            const { rows } = await db.query(queryStr, [property_id, guest_id]);
    
            if (rows.length === 0) {
                return null; // Return null if no favourite is found
            };
    
            return rows[0]; // Return the first favourite row found
        } catch (err) {
            console.error("Error fetching favourite:", err);
            throw { status: 500, msg: "Internal server error." };
        }
};

