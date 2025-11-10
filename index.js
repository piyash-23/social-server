const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const user = "eventServer";
const pass = "0jAHntRzMyx72724";

const uri = `mongodb+srv://${user}:${pass}@cluster0.6ecqvku.mongodb.net/?appName=Cluster0`;

app.get("/", (req, res) => {
  res.send("Server for social organization");
});
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const run = async () => {
  try {
    await client.connect();
    const eventsDB = client.db("eventsDB");
    const eventColl = eventsDB.collection("events");
    await eventColl.createIndex({ date: 1 }, { expireAfterSeconds: 0 });

    app.get("/events", async (req, res) => {
      const cursor = eventColl.find();
      const resul = await cursor.toArray();
      res.send(resul);
    });

    // event post
    app.post("/events", async (req, res) => {
      const { title, description, date, location, capacity } = req.body;
      if (!title || !date) {
        return res.status(400).json({ message: "Title and date is required" });
      }
      const eventDate = new Date(date);
      const now = new Date();
      if (eventDate <= now) {
        return res
          .status(400)
          .json({ message: "Event Date must be in the future" });
      }
      const newEvent = {
        title,
        description: description || "",
        date: eventDate,
        location,
        capacity,
        createdAt: new Date(),
      };
      const result = await eventColl.insertOne(newEvent);
      res.send(result);
    });

    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventColl.deleteOne(query);
      res.send(result);
    });

    app.patch("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedEvent = req.body;
      const update = {
        $set: updatedEvent,
      };
      const result = await eventColl.updateOne(query, update);
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Running from port ${port}`);
});
