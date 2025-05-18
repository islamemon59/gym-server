const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.anxcgnq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const gymDataCollection = client.db("gymDatabase").collection("gymbd");

    // get client from database
    app.get("/schedule", async (req, res) => {
      const {searchParams} = req.query
      console.log(searchParams);
      let query = {};
      if(searchParams){
        query = {title: {$regex:searchParams, $options: "i"}}
      }
      const result = await gymDataCollection.find(query).toArray();
      res.send(result);
    });

    //get client single data
    app.get("/schedule/:id", async (req, res) => {
      const id = req.params.id;
      console.log("client id:", id);
      const query = { _id: new ObjectId(id) };
      const result = await gymDataCollection.findOne(query);
      res.send(result);
    });

    //client details post in database
    app.post("/schedule", async (req, res) => {
      const newClient = req.body;
      console.log(newClient);
      const result = await gymDataCollection.insertOne(newClient);
      res.send(result);
    });

    // Delete client data from database
    app.delete("/schedule/:id", async (req, res) => {
      const id = req.params.id;
      console.log("client id:", id);
      const query = { _id: new ObjectId(id) };
      const result = await gymDataCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/schedule/:id", async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const {title, day, hour, data} = req.body
      const updatedDoc = {
        $set: {
          title,
          day,
          hour,
          data,
        }
      }
      const result = await gymDataCollection.updateOne(query, updatedDoc)
      res.send(result)
    })

    //Update specific data
    app.patch("/schedule/:id", async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const option = {upsert: true};
      const updatedDoc = {
        $set: {isCompleted: true}
      }
      const result = await gymDataCollection.updateOne(query, updatedDoc, option)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Our Gym server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
