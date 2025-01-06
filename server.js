const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to read JSON file
app.get('/getData', (req, res) => {
    fs.readFile('./assets/datas/schedule.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to write to JSON file
app.post('/updateData', (req, res) => {
    const newData = req.body;
    fs.writeFile('./assets/datas/schedule.json', JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json({ message: 'Data written successfully' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
