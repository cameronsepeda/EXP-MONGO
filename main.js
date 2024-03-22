const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://cameron_sepeda:XZCe95EA1QhAvbu3@cluster0.vep8ki4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auth_demo', { useNewUrlParser: true, useUnifiedTopology: true });
const User = mongoose.model('User', { user_ID: String, password: String });

// Default endpoint
app.get('/', (req, res) => {
    if (!req.cookies.authenticated) {
        res.send(`
            <h1>Login or Register</h1>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        `);
    } else {
        res.send(`<h1>Authentication Cookie exists: ${req.cookies.authenticated}</h1><br><a href="/cookies">View Cookies</a> | <a href="/clear-cookie">Clear Cookie</a>`);
    }
});

// Register form
app.get('/register', (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form action="/register" method="post">
            <input type="text" name="user_ID" placeholder="User ID" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="submit" value="Register">
        </form>
        <a href="/">Back to Home</a>
    `);
});

app.post('/register', async (req, res) => {
    const { user_ID, password } = req.body;
    await User.create({ user_ID, password });
    res.redirect('/login');
});

// Login form
app.get('/login', (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form action="/login" method="post">
            <input type="text" name="user_ID" placeholder="User ID" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="submit" value="Login">
        </form>
        <a href="/">Back to Home</a>
    `);
});

app.post('/login', async (req, res) => {
    const { user_ID, password } = req.body;
    const user = await User.findOne({ user_ID, password });
    if (user) {
        res.cookie('authenticated', user_ID, { maxAge: 60000 }); // expires in 1 minute
        res.redirect('/');
    } else {
        res.send('Invalid user_ID or password. <a href="/">Back to Home</a>');
    }
});

// View cookies endpoint
app.get('/cookies', (req, res) => {
    res.send(`
        <h1>Cookies</h1>
        <pre>${JSON.stringify(req.cookies, null, 2)}</pre>
        <a href="/">Back to Home</a>
    `);
});

// Clear cookie endpoint
app.get('/clear-cookie', (req, res) => {
    res.clearCookie('authenticated');
    res.send(`
        <h1>Authentication Cookie Cleared</h1>
        <a href="/">Back to Home</a>
    `);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
