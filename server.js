const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows other pages to fetch from your server
app.use(bodyParser.json()); // Allows server to read JSON from the form

const DOH_DATA_FILE = './mock-doh-data.json';
const PAGASA_DATA_FILE = './mock-pagasa-data.json';
const PORT = 3000;

// --- ENDPOINT 1: Give data to Map and Chart ---
app.get('/get-cases', (req, res) => {
    fs.readFile(DOH_DATA_FILE, 'utf8', (err, data) => {
        res.send(JSON.parse(data));
    });
});

// --- ENDPOINT 2: Receive data from Form ---
app.post('/add-case', (req, res) => {
    const newCase = req.body; // Get the data from Member 4's form

    fs.readFile(DOH_DATA_FILE, 'utf8', (err, data) => {
        const cases = JSON.parse(data);
        newCase.id = cases.length + 1; // Give it a new ID
        cases.push(newCase); // Add the new case to the list

        // Write the *updated* list back to the file
        fs.writeFile(DOH_DATA_FILE, JSON.stringify(cases, null, 2), (err) => {
            res.send({ message: 'Case added successfully!' });
        });
    });
});

// --- ENDPOINT 3: (For Member 6) Give alert to Map ---
app.get('/get-alert', (req, res) => {
    fs.readFile(PAGASA_DATA_FILE, 'utf8', (err, data) => {
        const weather = JSON.parse(data);
        let alertMsg = "";
        if (weather.alert_status === "Heavy Rain Warning") {
             alertMsg = "HIGH RISK FOR LEPTOSPIROSIS: Heavy rain reported.";
        }
        res.send({ message: alertMsg });
    });
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

