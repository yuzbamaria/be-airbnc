const db = require("../db/connection");

exports.fetchBookings = async(property_id) => {
    const queryStr = `
        SELECT 
            booking_id, 
            check_in_date, 
            check_out_date, 
            created_at 
        FROM bookings
        WHERE property_id = $1
        ORDER BY check_out_date;`;

    const { rows } = await db.query(queryStr, [property_id]);
    if(rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Resource not found." })
    };
    return { 
        bookings: rows, 
        property_id: property_id 
    };
};

// this.fetchBookings(6).then(result => console.log(result));