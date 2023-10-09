const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'hotel_user',
  password: 'password',
  database: 'hotel_reservation',
  connectionLimit: 10, // Adjust as needed
});

// Define a route to handle room availability search
app.get('/search-rooms', (req, res) => {
  const { checkInDate, checkOutDate, roomType, occupancy } = req.query;

  // Validate user input
  if (!checkInDate || !checkOutDate || !roomType || !occupancy) {
    return res.status(400).json({ error: 'Missing input data' });
  }

  // Construct the SQL query to retrieve available rooms
  const sql = `
    SELECT room_number, room_type, occupancy
    FROM rooms
    WHERE room_type = ? 
    AND occupancy >= ?
    AND room_number NOT IN (
      SELECT room_number
      FROM reservations
      WHERE check_in_date <= ? AND check_out_date >= ?
    )
  `;

  const values = [roomType, occupancy, checkOutDate, checkInDate];

  // Use the connection pool to query the database
  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return the available rooms to the user
    res.json({ rooms: results });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


//http://localhost:3000/search-rooms?checkInDate=2023-10-15&checkOutDate=2023-10-20&roomType=Standard&occupancy=2