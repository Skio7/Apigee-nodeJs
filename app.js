const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const hospitalRecords = [];
let latestId = 0;

app.use(bodyParser.json());

function isValidDateOfBirth(dob) {
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!dobRegex.test(dob)) return false;

    const [day, month, year] = dob.split('-');
    const monthNumber = parseInt(month, 10);
    const dayNumber = parseInt(day, 10);

    if (monthNumber === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const maxDaysInFeb = isLeapYear ? 29 : 28;
        if (dayNumber > maxDaysInFeb) {
            throw new Error('February cannot contain the specified date');
        }
    }

    return true;
}

function isValidUsername(username) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const consecutiveDotRegex = /\.{2,}/; // Check for consecutive dots
    return emailRegex.test(username) && !consecutiveDotRegex.test(username);
}

function isUsernameUnique(username) {
    return hospitalRecords.every(record => record.username !== username);
}

function isValidName(name) {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(name);
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('-');
}

app.post('/v1/hospital', (req, res) => {
    try {
        const { name, dob, username } = req.body;

        if (!name || !dob || !username) {
            throw new Error('Missing data. Please provide name, date of birth, and username.');
        }

        if (!isValidName(name)) {
            throw new Error('Name should contain only alphabets');
        }

        if (!isValidDateOfBirth(dob)) {
            throw new Error('Invalid date of birth format. Should be in DD-MM-YYYY format');
        }

        if (!isValidUsername(username)) {
            throw new Error('Invalid email format for username');
        }

        if (!isUsernameUnique(username)) {
            throw new Error('Username already exists');
        }

        latestId++; // Increment the latestId
        const doj = formatDate(new Date());

        const newRecord = {
            id: latestId,
            name,
            dob,
            doj,
            username
        };
        hospitalRecords.push(newRecord);

        res.status(200).json(newRecord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/v1/hospitals', (req, res) => {
    res.status(200).json(hospitalRecords.map(record => ({
        id: record.id,
        name: record.name,
        dob: record.dob,
        doj: record.doj,
    })));
});

app.use((req, res) => {
    res.status(404).json({ error: 'Invalid URL. Please check the endpoint and try again.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
