const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Create a MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'user123',
  database: 'hotel',
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Define an API endpoint to search for available rooms
app.post('/search-rooms', (req, res) => {
  // Extract user input from the request body
  const { checkinDate, checkoutDate, roomType, occupancy } = req.body;

  // Construct the SQL query to find available rooms
  const sql = `
    SELECT * FROM rooms
    WHERE room_type = ? 
    AND occupancy >= ? 
    AND room_id NOT IN (
      SELECT room_id FROM rooms
      WHERE (checkin_date <= ? AND checkout_date >= ?)
      OR (checkin_date <= ? AND checkout_date >= ?)
      OR (checkin_date >= ? AND checkout_date <= ?)
    )
  `;

  // Execute the query with user input
  db.query(
    sql,
    [roomType, occupancy, checkinDate, checkoutDate, checkinDate, checkoutDate, checkinDate, checkoutDate],
    (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'An error occurred' });
      } else {
        res.json({ availableRooms: results });
      }
    }
  );
});

// Serve static HTML and JS files
app.use(express.static('public'));

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
