const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://cameron_sepeda:XZCe95EA1QhAvbu3@cluster0.vep8ki4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'EXP-MONGO';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  if (req.cookies && req.cookies.authenticated) {
    res.send(`
      <h1>Welcome to the site!</h1>
      <p>You are authenticated.</p>
      <p>Authentication Cookie Value: ${req.cookies.authenticated}</p>
    `);
  } else {
    res.send(`
      <h1>Welcome to the site!</h1>
      <p>Please login or register</p>
      <form action="/login" method="POST">
        <button type="submit">Login</button>
      </form>
      <form action="/register" method="POST">
        <button type="submit">Register</button>
      </form>
    `);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the site!</h1>
    <p>Please login or register</p>
    <form action="/login" method="POST">
      <button type="submit">Login</button>
    </form>
    <form action="/register" method="POST">
      <button type="submit">Register</button>
    </form>
  `);
});

app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = client.db(dbName);
    const usersCollection = db.collection('credentials');
    const user = await usersCollection.findOne({ username, password });
    if (user) {
      res.cookie('authenticated', true);
      res.redirect('/');
    } else {
      res.send(`
        <h1>Login</h1>
        <p>Invalid username or password. Please try again.</p>
        <form action="/login" method="POST">
          <input type="text" name="username" placeholder="Username" required><br>
          <input type="password" name="password" placeholder="Password" required><br>
          <button type="submit">Login</button>
        </form>
      `);
    }
  } catch (error) {
    console.error('Error checking login credentials:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/register', (req, res) => {
  res.send(`
    <h1>Register</h1>
    <form action="/register" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Register</button>
    </form>
  `);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const usersCollection = db.collection('credentials');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      res.status(409).send('Username already exists. Please choose a different one.');
    } else {
      await usersCollection.insertOne({ username, password });
      res.cookie('authenticated', true);
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/all-cookies', (req, res) => {
  res.send(`
    <h1>All Cookies</h1>
    <pre>${JSON.stringify(req.cookies, null, 2)}</pre>
    <a href="/">Go Back</a>
  `);
});

app.get('/clear-cookies', (req, res) => {
  res.clearCookie('authenticated');
  res.send(`
    <h1>Cookies Cleared</h1>
    <p>All cookies have been cleared/reset.</p>
    <a href="/">Go Back to Default Route</a>
  `);
});
