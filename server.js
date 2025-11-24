const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // Allows other pages to fetch from your server
app.use(bodyParser.json()); // Allows server to read JSON from the form

// Use path.join to be safe with file paths
const DOH_DATA_FILE = path.join(__dirname, 'mock-doh-data.json');
// We'll keep this if you have the file, otherwise it might error if missing
const PAGASA_DATA_FILE = path.join(__dirname, 'mock-pagasa-data.json');
const PORT = 3000;

// --- ENDPOINT 1: Give data to Map and Chart ---
app.get('/get-cases', (req, res) => {
    fs.readFile(DOH_DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading DOH data');
        }
        res.send(JSON.parse(data));
    });
});

// --- ENDPOINT 2: UPDATE data from Report Form (NEW) ---
// This replaces the old '/add-case' logic for the new district system
app.post('/update-case', (req, res) => {
    const { id, disease, count } = req.body;

    fs.readFile(DOH_DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading database');
        }

        let cases = JSON.parse(data);

        // Find the district by its unique ID (e.g., "d1", "mnld3")
        const districtIndex = cases.findIndex(c => c.id === id);

        if (districtIndex !== -1) {
            // Update the specific disease count
            // "disease" will be "dengue", "lepto", or "influenza"
            cases[districtIndex][disease] = parseInt(count);

            // Write the updated list back to the file
            fs.writeFile(DOH_DATA_FILE, JSON.stringify(cases, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error writing to database');
                }
                console.log(`Updated District ${id}: Set ${disease} to ${count}`);
                res.send({ message: 'Data updated successfully!', success: true });
            });
        } else {
            res.status(404).send({ message: "District ID not found in database." });
        }
    });
});

// --- ENDPOINT 3: Give alert to Map (Kept from your original) ---
app.get('/get-alert', (req, res) => {
    if (fs.existsSync(PAGASA_DATA_FILE)) {
        fs.readFile(PAGASA_DATA_FILE, 'utf8', (err, data) => {
            if (err) return res.send({ message: "" });

            const weather = JSON.parse(data);
            let alertMsg = "";
            if (weather.alert_status === "Heavy Rain Warning") {
                alertMsg = "HIGH RISK FOR LEPTOSPIROSIS: Heavy rain reported.";
            }
            res.send({ message: alertMsg });
        });
    } else {
        res.send({ message: "" }); // Send empty if file doesn't exist
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});