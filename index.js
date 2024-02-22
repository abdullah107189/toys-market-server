const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
// midilware
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fx40ttv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const toysCollection = client.db("Toys_Market_DB").collection("All_Toys");

        // Send a ping to confirm a successful connection
        app.post('/addToy', async (req, res) => {
            const body = req.body;
            const result = await toysCollection.insertOne(body);
            res.send(result)
        })
        app.get('/allToyTab', async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result)
        })
        app.get('/allToys', async (req, res) => {
            const page = parseInt(req.query.page) || 0
            const limit = parseInt(req.query.limit) || 10
            const skip = page * limit
            const result = await toysCollection.find().skip(skip).limit(limit).toArray();
            res.send(result)
        })
        app.get('/totalToys', async (req, res) => {
            const result = await toysCollection.estimatedDocumentCount()
            res.send({result});
        })


        // my toys 
        app.get('/allToys/:email', async (req, res) => {
            const email = req.params.email;
            const quary = { user_email: email }
            const result = await toysCollection.find(quary).toArray()
            res.send(result);
        });

        app.get('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(quary)
            res.send(result);
        });

        app.patch('/myToys/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateToys = req.body;
            const updateDoc = {
                $set: {
                    category: updateToys.category,
                    price: updateToys.price,
                    quantity: updateToys.quantity,
                    description: updateToys.description,
                },
            };
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.send(result);
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})