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

app.use((req, res, next) => {
  // Exclude certain routes from redirection
  if (req.path === '/' || req.path === '/login' || req.path === '/register') {
    next();
  } else if (req.cookies && req.cookies.authenticated) {
    // If authenticated, continue to the next middleware
    next();
  } else {
    // If not authenticated, redirect to the default route
    res.redirect('/');
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

  // Check credentials against MongoDB
  try {
    const db = client.db(dbName);
    const usersCollection = db.collection('credentials');
    const user = await usersCollection.findOne({ username, password });
    if (user) {
      // If user found, set authentication cookie and redirect to default route
      res.cookie('authenticated', true);
      res.redirect('/');
    } else {
      // If user not found, render login form with error message
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
    <h1>Login</h1>
    <form action="/register" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Register</button>
    </form>
  `);
});

app.post('/register', async (req, res) => {
  // Retrieve registration information from the request body
  const { username, password } = req.body;
  
  try {
    // Connect to the MongoDB database
    await client.connect();
    console.log('Connected to MongoDB');

    // Access the database and collection
    const db = client.db(dbName);
    const usersCollection = db.collection('credentials');

    // Check if the username already exists in the database
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      // If username already exists, send a message indicating the conflict
      res.status(409).send('Username already exists. Please choose a different one.');
    } else {
      // If username does not exist, insert the new user into the database
      await usersCollection.insertOne({ username, password });
      // Set authentication cookie for the new user
      res.cookie('authenticated', true);
      // Redirect to the default route
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});
