const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const users = [];

app.post('/v1/hospital', (req, res) => {
    const { name, dob, username } = req.body;

    try {
        validateName(name);
        validateDob(dob);
        validateUsername(username);
        checkExistingUsername(username);

        const user = {
            id: generateUniqueId(),
            name,
            dob,
            doj: getCurrentDate(),
            username
        };

        users.push(user);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/v1/hospital/:username', (req, res) => {
    const { username } = req.params;
    const user = users.find(user => user.username === username);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/v1/hospital', (req, res) => {
    res.json(users);
});

function validateName(name) {
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        throw new Error('Invalid name. Name should contain only alphabets.');
    }
}

function validateDob(dob) {
    const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dobRegex.test(dob)) {
        throw new Error('Invalid dob format. Please use DD-MM-YYYY.');
    }
}

function validateUsername(username) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        throw new Error('Invalid username format. Please use a valid email address.');
    }
}

function checkExistingUsername(username) {
    if (users.some(user => user.username === username)) {
        throw new Error('Username already exists. Please choose a different one.');
    }
}

function generateUniqueId() {
    return Math.floor(Math.random() * 1000); // Mocking id generation
}

function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
