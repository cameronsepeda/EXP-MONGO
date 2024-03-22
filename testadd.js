const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://cameron_sepeda:XZCe95EA1QhAvbu3@cluster0.vep8ki4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.cookies && req.cookies.authenticated) {
    next();
  } else {
    res.send(`
      <h1>Welcome!</h1>
      <p>Please login or register</p>
      <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <form action="/register" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Register</button>
      </form>
    `);
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Simulated login logic: Check if the user exists and password matches
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    // For demonstration purposes, simply set an authentication cookie
    res.cookie('authenticated', true);
    res.redirect('/');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Simulated registration logic: Check if username is available and store new user
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    res.status(400).send('Username already exists');
  } else {
    // Store the new user
    users.push({ username, password });
    // For demonstration purposes, simply set an authentication cookie
    res.cookie('authenticated', true);
    res.redirect('/');
  }
});

app.get('/', function(req, res) {
  var outstring = 'Default endpoint starting on date: ' + Date.now();
  outstring += '<p><a href=\"./task1\">Go to Task 1</a>';
  outstring += '<p><a href=\"./task2\">Go to Task 2</a>';
  res.send(outstring);
});

app.get('/task1', function(req, res) {
  var outstring = 'Starting Task 1 on date: ' + Date.now();
  res.send(outstring);
});

app.get('/task2', function(req, res) {
  var outstring = 'Starting Task 2 on date: ' + Date.now();
  res.send(outstring);
});

app.get('/say/:name', function(req, res) {
  res.send('Hello ' + req.params.name + '!');
});


// Access Example-1
// Route to access database using a parameter:
// access as ...app.github.dev/api/mongo/9876
app.get('/api/mongo/:item', function(req, res) {
const client = new MongoClient(uri);

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
    const where2put = database.collection('cmps415');

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
