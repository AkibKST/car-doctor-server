const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin : ['http://localhost:5173'],
  credentials : true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) =>{
    res.send('doctor is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s1acxwp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware
const logger = async (req, res, next)=>{
  console.log('called:', req.host, req.originalUrl);
  next();
}

// verify token
const verifyToken = async(req, res, next) =>{
  const token = req.cookies?.token;
  console.log('value of token in middleware', token)
  if(!token){
    return res.status(401).send({message: 'forbidden'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
    // error
    if(err){
      console.log(err)
      return res.status(401).send({message: 'unauthorized'})
    }
    // if token is valid then it would be decoded
    console.log('value in the token', decoded);
    req.user = decoded;
    next();
  })
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('services');
    const bookingCollection = client.db('carDoctor').collection('bookings');

    // auth related api
    app.post('/jwt', logger, async(req, res) => {
      const user = req.body;
      console.log(user);
      // ganerate a token for this user mail with expiresIn time and secret
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      
      res
      .cookie('token', token, {
        httpOnly: true,
        secure: false
      })
      .send({success: true});
    })


    // services route er jonno api
    app.get('/services', logger, async(req, res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // ekta single id er jonno api
    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};

        const options = {
          projection: { title: 1, price: 1, service_id: 1, img: 1, customerName: 1, email: 1, service: 1}
        };

        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    })

    // bookings

    app.get('/bookings', logger, verifyToken, async(req, res) =>{
      console.log(req.query.email);
      // console.log('tok tok token', req.cookies.token)
      let query = {};
      if(req.query.email){
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/bookings', async(req, res)=>{
        const booking = req.body;
        console.log(booking);
        const result = await bookingCollection.insertOne(booking)
        res.send(result)
    })

    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc = {
        $set: {
          status: updateBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Car Doctor Server is running on port: ${port}`)
})