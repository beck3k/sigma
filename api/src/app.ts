import express from 'express';
import { StreamModel, ViewerModel } from 'db';
import CryptoJS from 'crypto-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app = express()
const port = 3123;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('API Alive');
});

function getKey(){
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var name = "";
  var charactersLength = characters.length;
  for ( var i = 0; i < 8; i++ ) {
    name += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  var key = CryptoJS.SHA256("live/"+name).toString();
  return key;
}

app.post('/stream', async (req, res) => {
  var key = getKey();
  var publicKey = req.body.publicKey;

  var stream = await StreamModel.findOneAndUpdate({
    publicKey
  }, {
    key
  }, {
    new: true,
    upsert: true
  });
  stream.save();
  res.send({
    _id: stream._id,
    key,
    streamKey: `${stream._id}?pwd=${key}`
  });
});

app.get('/private/stream/:publicKey', async (req, res) => {
  var stream = await StreamModel.findOneAndUpdate({
    publicKey: req.params.publicKey
  });

  if(!stream) {
    var key = getKey();
    stream = await StreamModel.create({
      publicKey: req.params.publicKey,
      key: key
    });
    stream.save();
  }

  res.json({
    stream: {
      ...stream,
      streamKey: `${stream._id}?pwd=${stream.key}`
    }
  });
});

app.get('/streams', async (req, res) => {
  const streams = await StreamModel.find({}, '-key');

  res.send({
    streams
  });
});

app.get('/stream/:pubkey', async (req, res) => {
  const stream = await StreamModel.findOne({
    publicKey: req.params.pubkey
  }, '-key');
  res.send({
    stream
  });
});

// PublicKey is of the streamer
app.post('/follow/:publicKey', async (req, res) => {
  // Check that viewer exists
  await ViewerModel.findOneAndUpdate({
    publicKey: req.body.publicKey
  }, {}, {
    upsert: true
  });
  // Check if following already, and push
  const followers = await ViewerModel.updateOne(
    { 
      publicKey: req.body.publicKey,
      following: {
        $ne: req.params.publicKey
      }
    },
    {
      $push: {
        following: req.params.publicKey
      },
    }
  );

  res.json({
    followers
  })
});

// Public key is of the viewer, will not be required after Auth implemented
app.get('/following/:publicKey', async (req, res) => {
  const following = await ViewerModel.findOne({
    publicKey: req.params.publicKey
  });

  res.json({
    following: (following) ? following.following : []
  });
});

async function run(): Promise<void> {
  await mongoose.connect(<string>process.env.DBURL, {

  });

  app.listen(port, (err?: string) => {
    if(err){
      return console.error(err);
    }
    return console.log(`API on ${port}`);
  });
}

run().catch(err => console.log(err));
