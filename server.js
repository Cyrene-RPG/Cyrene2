const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// TEMP database (we replace later)
let users = [];

// SIGNUP
app.post('/signup', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ success: false, message: "No username" });
    }

    users.push({ username });

    console.log("User created:", username);

    res.json({ success: true });
});

// GET USERS (debug)
app.get('/users', (req, res) => {
    res.json(users);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});