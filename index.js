const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    const orderCollection = client
      .db("bicycle_manufacturer")
      .collection("order");
    const userCollection = client.db("bicycle_manufacturer").collection("user");
    const paymentCollection = client
      .db("bicycle_manufacturer")
      .collection("payments");



    // update payment history
    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };

      const result = await paymentCollection.insertOne(payment);
      const updatedorder = await orderCollection.updateOne(filter, updatedDoc);
      res.send(updatedorder);
    });

    //load data part API-----done
    app.get("/part", async (req, res) => {
      const query = {};
      const cursor = partCollection.find(query);
      const part = await cursor.limit(6).toArray();
      res.send(part);
    });

    //load inventory details-done
    app.get("/part/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const part = await partCollection.findOne(query);
      res.send(part);
    });

    // order part
    app.post("/order", async (req, res) => {
      const doctor = req.body;
      const result = await orderCollection.insertOne(doctor);
      res.send(result);
    });

    // User Creation and update accesstoken-done
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    //My Order load-done
    app.get("/order", async (req, res) => {
      const orderEmail = req.query.orderEmail;
      const query = { email: orderEmail };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    // load payment order id db-done
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
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
