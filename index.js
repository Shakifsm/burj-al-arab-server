const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhonm.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;
const port = 5000


const app = express();

app.use(cors());
app.use(bodyParser.json());




var serviceAccount = require("./Configs/burj-al-arab-8c0bb-firebase-adminsdk-x6gw0-e77cb87211.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burj-al-arab").collection("bookings");

    app.post('/addBokking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization
        console.log(bearer);
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1]
            console.log({idToken});
            admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken){
                let tokenEmail = decodedToken.email
                const queryEmail = req.query.email
                console.log({tokenEmail},{ queryEmail});
                if (tokenEmail == queryEmail){
                    bookings.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })
                }

                else{
                    res.status(401).send('Access Denied')
                }

            })
            .catch(function (error){
                res.status(401).send('Access Denied')
            })
        }

        else{
            res.status(401).send('Access Denied')
        }

    })
})


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)


