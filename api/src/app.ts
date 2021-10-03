import express from 'express';
import { StreamModel } from 'db';
import CryptoJS from 'crypto-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config();

const app = express()
const port = 3123;



app.get('/', (req, res) => {
  res.send('API Alive');
});

app.get('/stream', async (req, res) => {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var name = "";
  var charactersLength = characters.length;
  for ( var i = 0; i < 8; i++ ) {
    name += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  var key = CryptoJS.SHA256("live/"+name).toString();
  var stream = new StreamModel({
    name,
    key
  });
  stream.save();
  res.send({
    name,
    key
  });
});

app.get('/streams', async (req, res) => {
  const streams = await StreamModel.find();

  res.send({
    streams
  });
});

// app.post('/stream', (req, res) => {

// });

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
