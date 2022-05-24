const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// var nodemailer = require("nodemailer");
// const mg = require("nodemailer-mailgun-transport");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

// require('crypto').randomBytes(64).toString('hex')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqmpm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("sdfsds");
    const partCollection = client.db("bicycle_manufacturer").collection("part");

    //load data part API-----
    app.get("/part", async (req, res) => {
      const query = {};
      const cursor = partCollection.find(query);
      const part = await cursor.limit(6).toArray();
      res.send(part);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From bicycle!");
});

app.listen(port, () => {
  console.log(`bicycle App listening on port ${port}`);
});