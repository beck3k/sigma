import express from 'express';
import { CategoryModel, StreamModel, Stream, Category, ViewerModel } from 'db';
import CryptoJS from 'crypto-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

import { Strategy as AuthStrategy } from 'passport-custom';
import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import { ec as EC } from 'elliptic';
import { default as KeyEncoder } from 'key-encoder';
import bs58check from 'bs58check';

const ec = new EC("secp256k1");

const app = express()
const port = 3123;

import SocketBridge from './bridge';

dotenv.config();

app.use(bodyParser.json());
app.use(cors());

app.use(passport.initialize());

passport.use('deso', new AuthStrategy((req, done) => {
  var token = null;
  var publicKey = null;
  if(req && req.route.methods.post && req.body.JWT) {
    token = req.body.JWT;
    publicKey = req.body.PublicKeyBase58Check;
  }else if(req && req.route.methods.get) {
    token = req.headers['authorization'];
    publicKey = req.headers['publickeybase58check'];
  } else {
    done(null, false);
  }

  try {
    const decodedKey = bs58check.decode(publicKey);
    const decodedKeyArray = [...decodedKey];
    const rawPK = decodedKeyArray.slice(3);
    const hexPK = ec.keyFromPublic(rawPK).getPublic().encode('hex', true);

    const keyEncoder = new KeyEncoder("secp256k1");
    const encodedPK = keyEncoder.encodePublic(hexPK, "raw", "pem");

    const result = jsonwebtoken.verify(token, encodedPK, {
      algorithms: ["ES256"]
    });
    done(null, result);
  } catch(error) {
    done(null, false);
  }
  
}));

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

// Reset stream key
app.post('/stream', passport.authenticate('deso', { session: false }), async (req, res) => {
  var key = getKey();
  var publicKey = req.body.PublicKeyBase58Check;

  var stream = await StreamModel.findOneAndUpdate({
    publicKey
  }, {
    key,
    viewerCount: 0
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

// Get private stream data
app.get('/private/stream', passport.authenticate('deso', { session: false }), async (req, res) => {
  const publicKey: any = req.headers['publickeybase58check'];
  var stream = await StreamModel.findOne({
    publicKey
  });

  if(!stream) {
    var key = getKey();
    stream = await StreamModel.create({
      publicKey,
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

app.get('/streams/live', async (req, res) => {
  const streams = await StreamModel.find({
    isLive: true
  }, '-key');

  res.send({
    streams
  });
});

app.get('/streams/live/one', async (req, res) => {
  const stream = await StreamModel.findOne({
    isLive: true
  }, '-key');

  res.send({
    stream
  });
});

app.get('/stream/:publicKey/info', async (req, res) => {
  const stream = await StreamModel.findOne({
    publicKey: req.params.publicKey
  }, '-key');

  res.json({
    stream: {
      title: stream.title,
      description: stream.description,
      category: stream.category,
      isLive: stream.isLive,
      viewerCount: stream.viewerCount
    }
  });
});

// Update Stream Info
app.post('/stream/info', passport.authenticate('deso', { session: false }), async (req, res) => {
  var publicKey = req.body.PublicKeyBase58Check;
  const stream = await StreamModel.findOneAndUpdate({
    publicKey
  }, {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
  });

  console.log(req.body);

  const fuckingOld = await CategoryModel.updateOne({
    streams: stream._id,
  }, {
    $pullAll: {
      streams: [stream._id]
    }
  });

  const newShit = await CategoryModel.updateOne({
    _id: req.body.category,
    streams: {
      $ne: stream._id
    }
  }, {
    $push: {
      streams: stream._id
    }
  });

  res.json({stream});
});

app.get('/stream/:pubkey', async (req, res) => {
  const stream = await StreamModel.findOne({
    publicKey: req.params.pubkey
  }, '-key');

  if(stream && stream.category) {
    await stream.populate('category');
  }

  res.send({
    stream
  });
});

// PublicKey is of the streamer
app.post('/follow/:publicKey', passport.authenticate('deso', { session: false }), async (req, res) => {
  var publicKey = req.body.PublicKeyBase58Check;

  // Check that personFollowing exists
  await ViewerModel.findOneAndUpdate({
    publicKey
  }, {}, {
    upsert: true
  });

  // Check that personFollowed exists
  await ViewerModel.findOneAndUpdate({
    publicKey: req.params.publicKey
  }, {}, {
    upsert: true
  });

  // Check if following already, and push
  const personFollowing = await ViewerModel.updateOne(
    {
      publicKey,
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

  const personFollowed = await ViewerModel.updateOne(
    {
      publicKey: req.params.publicKey,
      followers: {
        $ne: publicKey
      }
    },
    {
      $push: {
        followers: publicKey
      },
    }
  );

  res.json({
    personFollowing,
    personFollowed
  })
});



// Public key is of the personFollowing, will not be required after Auth implemented
app.get('/following', async (req, res) => {
  const publicKey: any = req.headers['publickeybase58check'];
  const personFollowing = await ViewerModel.findOne({
    publicKey
  });

  res.json({
    following: (personFollowing) ? personFollowing.following : []
  });
});

// Public key is of the personFOllowed, will not be required after Auth implemented
app.get('/followers', async (req, res) => {
  const publicKey: any = req.headers['publickeybase58check'];
  const personFollowed = await ViewerModel.findOne({
    publicKey
  });

  res.json({
    followers: (personFollowed) ? personFollowed.followers : []
  });
});



app.post('/unfollow/:pubicKey', passport.authenticate('deso', { session: false }), async (req, res) => {
  var publicKey = req.body.PublicKeyBase58Check;

  // Update personFollowing
  const personFollowing = await ViewerModel.updateOne({
    publicKey
  },
  {
    $pullAll: {
      following: [req.params.pubicKey]
    }
  });

  // Update personFollowed
  const personFollowed = await ViewerModel.updateOne({
    publicKey: req.params.pubicKey
  },
  {
    $pullAll: {
      followers: [publicKey]
    }
  });

  res.send({
    personFollowing, personFollowed
  })
});

app.get('/categories', async (req, res) => {
  const categories = await CategoryModel.find();

  res.send({
    categories
  });
});

function isStream(obj: Stream | any ): obj is Stream {
  return (obj && obj.key);
}

app.get('/category/:category', async (req, res) => {
    try {
      const fuckYou = await CategoryModel.findById(req.params.category);
      if(fuckYou) {
        await CategoryModel.findById(req.params.category).populate('streams').exec((err, category) => {
          if(category.streams) {
            var streams = category.streams.map((stream) => {
              if(isStream(stream)) {
                if(stream.isLive) {
                  return stream;
                }
              }
            });
            res.json({
              streams: streams
            });
          } else {
            res.json({
              streams: null,
              fuck: true
            })
          }
        });
      } else {
        res.send('Fuck off');
      }
    } catch(e) {
      res.json({
        category: null,
        categoryNotFound: true
      });
    }
   

  // res.json({
  //   category: category.streams.map((stream) => {
  //     console.log(stream.isLive);
  //     // if(stream.isLive){
  //       return stream
  //     // }
  //   })
  // });
  
});

async function run(): Promise<void> {
  await mongoose.connect(<string>process.env.DBURL, {

  });

  const socketBridge = new SocketBridge();

  async function updateViewCount(pubKey, count) {
    const viewer = await StreamModel.findOneAndUpdate({
      publicKey: pubKey
    }, {
      viewerCount: count
    });
  }

  socketBridge.onDisconnect((topic, count) => {
    if(topic.substring(1,5) == "chat") {
      updateViewCount(topic.substring(6), count);
    }
    console.log('topic ', topic, ' has ', count);
  });
  socketBridge.onConnect((topic, count) => {
    if(topic.substring(1,5) == "chat") {
      updateViewCount(topic.substring(6), count);
    }
    console.log('topic ', topic, ' has ', count);
  });

  socketBridge.start();

  app.listen(port, (err?: string) => {
    if(err){
      return console.error(err);
    }
    return console.log(`API on ${port}`);
  });
}

run().catch(err => console.log(err));
