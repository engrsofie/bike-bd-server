const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require("cors")
const bodyParser = require("body-parser")
require('dotenv').config();

const port = process.env.PORT || 5055;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


console.log(process.env.DB_USER);
app.get("/", (req, res) => {
res.send("Hello World!");
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yx4ql.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("error", err);
  const eventCollection = client.db("volunteer").collection("events");
  const orderProductCollection = client.db("volunteer").collection("orders");

  app.get("/events", (req, res) => {
    eventCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.post("/addEvent", (req, res) => {
    const newEvent = req.body;
    console.log("adding new event: ", newEvent);
    eventCollection.insertOne(newEvent).then((result) => {
      console.log("inserted Count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  // Checkout
  app.get('/checkout/:id',(req,res)=>{
    const id = req.params.id;
    console.log(id);
    eventCollection.find({ _id: ObjectId(id) }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  })

    app.post("/addOrderProduct", (req, res) => {
      const orders = req.body;
      // console.log(orders);
      orderProductCollection.insertOne(orders).then((result) => {
        res.send(result.insertedCount > 0);
        console.log("Order added Successfully");
      });
    });

     // Delete books method
    app.delete("/deleteBook/:id", (req, res) => {
      const id = ObjectId(req.params.id);
      eventCollection.findOneAndDelete({ _id: id }).then((documents) => {
        res.send(!!documents.value);
        console.log("Book deleted successfully");
      });
    });

    // Order list
      app.get("/orderList", (req, res) => {
        orderProductCollection
          .find({ orderOwnerEmail: req.query.email })
          .toArray((err, documents) => {
            res.send(documents);
          });
      });

 
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
