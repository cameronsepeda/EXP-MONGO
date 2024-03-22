const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://cameron_sepeda:XZCe95EA1QhAvbu3@cluster0.vep8ki4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'EXP-MONGO';

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
  // Check if authentication cookie exists
  if (req.cookies && req.cookies.authenticated) {
    // If authenticated, continue to the next middleware
    next();
  } else {
    // If not authenticated, redirect to the default route
    res.redirect('/');
  }
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
    const usersCollection = db.collection('users');
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
    <h1>Register</h1>
    <form action="/register" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Register</button>
    </form>
  `);
});

app.post('/register', (req, res) => {
  // Retrieve registration information from the request body
  const { username, password } = req.body;
  
  // Perform registration logic here (e.g., save user to database)
  // For demonstration purposes, simply set an authentication cookie
  res.cookie('authenticated', true);
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome!</h1>
    <p>Please login or register</p>
    <form action="/login" method="POST">
      <button type="submit">Login</button>
    </form>
    <form action="/register" method="POST">
      <button type="submit">Register</button>
    </form>
  `);
});

async function run() {
  try {
    const database = client.db('EXP-MONGO');
    const parts = database.collection('cmps415');

    // Here we make a search query where the key is hardwired to 'partID' 
    // and the value is picked from the input parameter that comes in the route
     const query = { partID: req.params.item };
     console.log("Looking for: " + query);

    const part = await parts.findOne(query);
    console.log(part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});

// Access Example-2
// Route to access database using two parameters:
app.get('/api/mongo2/:inpkey&:item', function(req, res) {
// access as ...app.github.dev/api/mongo2/partID&12345
console.log("inpkey: " + req.params.inpkey + " item: " + req.params.item);

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db('EXP-MONGO');
    const where2look = database.collection('cmps415');

    // Here we will make a query object using the parameters provided with the route
    // as they key:value pairs
    const query = {};
    query[req.params.inpkey]= req.params.item;

    console.log("Looking for: " + JSON.stringify(query));

    const part = await where2look.findOne(query);
    console.log('Found this entry: ', part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});

// Route to write to the database:
// Access like this:  https://.....app.github.dev/api/mongowrite/partID&54321
// References:
// https://www.mongodb.com/docs/drivers/node/current/usage-examples/insertOne
// https://www.mongodb.com/docs/drivers/node/current/usage-examples/insertMany

app.get('/api/mongowrite/:inpkey&:inpval', function(req, res) {
console.log("PARAMS: inpkey: " + req.params.inpkey + " inpval: " + req.params.inpval);

const client = new MongoClient(uri);

// The following is the document to insert (made up with input parameters) :
// First I make a document object using static fields
const doc2insert = { 
  name: 'Cris', 
  Description: 'This is a test', };
// Additional fields using inputs:
  doc2insert[req.params.inpkey]=req.params.inpval;

console.log("Adding: " + doc2insert);

async function run() {
  try {
    const database = client.db('EXP-MONGO');
    const where2put = database.collection('credentials');

    const doit = await where2put.insertOne(doc2insert);
    console.log(doit);
    res.send('Got this: ' + JSON.stringify(doit));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});
