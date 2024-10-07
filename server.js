const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session setup
app.use(session({
    secret: 'homely-kitchen-secret',
    resave: false,
    saveUninitialized: true
}));

// Function to read users from JSON file
function readUsers() {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
}

// Function to write users to JSON file
function writeUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/homely-kitchen/home.html');
});

app.get('/homely-kitchen/login', (req, res) => {
    res.sendFile(__dirname + '/homely-kitchen/login.html');
});

app.get('/homely-kitchen/signup', (req, res) => {
    res.sendFile(__dirname + '/homely-kitchen/signup.html');
});

app.get('/homely-kitchen/order', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/homely-kitchen/order.html');
    } else {
        res.redirect('/login');
    }
});

// Sign-up logic
app.post('/homely-kitchen/signup', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const users = readUsers();
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).send('User already exists.');
    }

    // Hash the password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    writeUsers(users);

    res.redirect('/homely-kitchen/login');
});

// Login logic
app.post('/homely-kitchen/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        req.session.user = user;
        res.redirect('/homely-kitchen/order');
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// Order processing
app.post('/homely-kitchen/order', (req, res) => {
    // Order processing logic here (not included in this example)
    res.send('Order placed successfully!');
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

