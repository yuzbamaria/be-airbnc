const db = require("../db/connection");

exports.fetchReviews = async(property_id) => {
    const queryStr = `
        SELECT 
            reviews.review_id,
            reviews.comment,
            reviews.rating,
            reviews.created_at,
            CONCAT(users.first_name, ' ', users.surname) AS guest,
            users.avatar AS guest_avatar
        FROM reviews
        JOIN users ON
            reviews.guest_id = users.user_id
        JOIN properties ON
            reviews.property_id = properties.property_id
        WHERE properties.property_id = $1
        ORDER BY reviews.created_at desc`;
    const { rows } = await db.query(queryStr, [property_id]);
    let totalRating = 0;
    rows.forEach((review) => {
        totalRating += review.rating;
    });
    const averageRating = totalRating / rows.length;
    const reviews = { reviews: rows };
    return {...reviews, average_rating: averageRating}
};

exports.createReview = async(property_id, guest_id, rating, comment) => {
    const queryStr = `
        INSERT INTO reviews
        (property_id, guest_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`;
    const { rows } = await db.query(queryStr, [property_id, guest_id, rating, comment]);
    return rows[0];
};

exports.removeReview = async(property_id) => {
    const queryStr = `DELETE FROM reviews WHERE property_id = $1 RETURNING *;`;
    const result = await db.query(queryStr, [property_id]);
    if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Review not found."});
    };
};
