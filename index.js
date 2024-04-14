const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// MongoDB Atlas connection string
const uri = 'mongodb+srv://adminotem:nPXdkaZahAFuEc7e@ailicedbs.y8ifolx.mongodb.net/';

// Function to connect to MongoDB Atlas
async function connectToMongoDB() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connection Succefull");
    return client.db('accounts').collection('users');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

// Handle registration POST request
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const usersCollection = await connectToMongoDB();

    // Check if email or username already exists
    const existingUser = await usersCollection.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).send({ error: 'Email or username already exists' });
    }

    // Insert user data into MongoDB
    const result = await usersCollection.insertOne({ username, email, password });

    res.status(201).send({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Handle login POST request
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersCollection = await connectToMongoDB();

    // Check if the user exists with the provided email and password
    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      // If user does not exist, return an error response
      return res.status(404).send({ error: 'No account exists with provided credentials' });
    }

    // If user exists, return a success response with user data
    res.status(200).send({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
