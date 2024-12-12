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

exports.postBooking = async(property_id, guest_id, check_in_date, check_out_date) => {
    const { rows } = await db.query(`SELECT check_in_date, check_out_date FROM bookings
        WHERE property_id = $1`, [property_id]);

    const newCheckIn = new Date(check_in_date);
    const newCheckOut = new Date(check_out_date);

    for (const row of rows) {
        const existingCheckIn = row.check_in_date;
        const existingCheckOut = row.check_out_date;

        if (newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut ||
            newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut ||
            newCheckIn === existingCheckIn && newCheckOut === existingCheckOut
        ) {
            return Promise.reject({ status: 409, msg: "Property is booked for these dates." });
        };
    };

    const queryStr = `
        INSERT INTO bookings
        (property_id, guest_id, check_in_date, check_out_date)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`;
    const result = await db.query(queryStr, [property_id, guest_id, check_in_date, check_out_date]);

    return {
        msg: "Booking successful",
        booking_id: result.rows[0].booking_id
    };
};

exports.removeBooking = async(booking_id) => {
    const queryStr = `DELETE FROM bookings WHERE booking_id = $1 RETURNING *;`;
    const result = await db.query(queryStr, [booking_id]);

    if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Booking not found."});
    };
};