import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { object, string } from "yup";

const listSchema = object({
  listname: string().required(),
});

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Setup Express
const port = 3000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db("itemtracker");
const listsCollection = db.collection("lists");

app.get("/", (req, res) => {
  res.sendFile("views/index.html");
});

app.get("/lists", async (req, res) => {
  let lists = await listsCollection.find({}).toArray();
  res.json(lists);
});

app.get("/listsearch", async (req, res) => {
  const query = req.query.listname;

  let lists = await listsCollection
    .find({ listname: new RegExp(query, "i") })
    .toArray();
  res.json(lists);
});

app.get("/lists/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id) === false) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  let list = await listsCollection.findOne({ _id: ObjectId(req.params.id) });
  res.json(list);
});

app.delete("/lists/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id) === false) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  await listsCollection.deleteOne({ _id: ObjectId(req.params.id) });
  res.json({
    success: true,
    deleted: req.params.id,
  });
});

app.get("/findlistbykey", async (req, res) => {
  const key = req.query.key;
  const value = req.query.value;

  let lists = await listsCollection
    .find({ [key]: new RegExp(value, "i") })
    .toArray();
  res.json(lists);
});

app.post("/lists", async (req, res) => {
  let entry;
  try {
    entry = listSchema.validateSync({ itemList: [], ...req.body });
  } catch (e) {
    res.status(403).send(e);
  }

  await listsCollection.insertOne(entry);

  res.json({
    success: true,
    list: entry,
  });
});

app.put("/lists/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id) === false) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  let list = await listsCollection.findOne({ _id: ObjectId(req.params.id) });
  list = { ...list, ...req.body, itemList: list.itemList };
  await listsCollection.replaceOne({ _id: ObjectId(req.params.id) }, list);

  res.json({
    success: true,
    list: list,
  });
});

app.post("/lists/:id/items", async (req, res) => {
  if (ObjectId.isValid(req.params.id) === false) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  let list = await listsCollection.findOne({ _id: ObjectId(req.params.id) });

  if (!list) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  const newItem = { _id: ObjectId(), ...req.body };

  const updatedRecord = await listsCollection.updateOne(
    { _id: ObjectId(req.params.id) },
    { $push: { itemList: newItem } }
  );

  list = await listsCollection.findOne({ _id: ObjectId(req.params.id) });

  res.json({
    success: true,
    list,
  });
});

app.delete("/lists/:listid/items/:itemid", async (req, res) => {
  if (ObjectId.isValid(req.params.listid) === false) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  let list = await listsCollection.findOne({
    _id: ObjectId(req.params.listid),
  });

  if (!list) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  if (ObjectId.isValid(req.params.itemid) === false) {
    return res.status(404).send("Item not found, did you use a correct ID?");
  }

  await listsCollection.updateOne(
    { _id: ObjectId(req.params.listid) },
    {
      $pull: { itemList: { _id: ObjectId(req.params.itemid) } },
    }
  );

  list = await listsCollection.findOne({ _id: ObjectId(req.params.listid) });

  res.json({
    success: true,
    list,
  });
});

app.put("/lists/:listid/items/:itemid", async (req, res) => {
  if (ObjectId.isValid(req.params.listid) === false) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  let list = await listsCollection.findOne({
    _id: ObjectId(req.params.listid),
  });

  if (!list) {
    return res.status(404).send("List not found, did you use a correct ID?");
  }

  if (ObjectId.isValid(req.params.itemid) === false) {
    return res.status(404).send("Item not found, did you use a correct ID?");
  }

  const itemList = list.itemList || [];
  const item = itemList.find(
    (item) => item._id.toString() === req.params.itemid
  );

  if (!item) {
    return res.status(404).send("Item not found, did you use a correct ID?");
  }

  await listsCollection.updateOne(
    {
      _id: ObjectId(req.params.listid),
      itemList: { $elemMatch: { _id: ObjectId(req.params.itemid) } },
    },
    {
      $set: {
        "itemList.$": { ...item, ...req.body },
      },
    }
  );

  list = await listsCollection.findOne({ _id: ObjectId(req.params.listid) });

  res.json({
    success: true,
    list,
  });
});

app.listen(port, () => console.log(`Listening on ${port}`));
