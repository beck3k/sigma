"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("db");
const crypto_js_1 = __importDefault(require("crypto-js"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const passport_custom_1 = require("passport-custom");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const elliptic_1 = require("elliptic");
const key_encoder_1 = __importDefault(require("key-encoder"));
const bs58check_1 = __importDefault(require("bs58check"));
const ec = new elliptic_1.ec("secp256k1");
const app = (0, express_1.default)();
const port = 3123;
const bridge_1 = __importDefault(require("./bridge"));
dotenv_1.default.config();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use(passport_1.default.initialize());
passport_1.default.use('deso', new passport_custom_1.Strategy((req, done) => {
    var token = null;
    var publicKey = null;
    if (req && req.route.methods.post && req.body.JWT) {
        token = req.body.JWT;
        publicKey = req.body.PublicKeyBase58Check;
    }
    else if (req && req.route.methods.get) {
        token = req.headers['authorization'];
        publicKey = req.headers['publickeybase58check'];
    }
    else {
        done(null, false);
    }
    try {
        const decodedKey = bs58check_1.default.decode(publicKey);
        const decodedKeyArray = [...decodedKey];
        const rawPK = decodedKeyArray.slice(3);
        const hexPK = ec.keyFromPublic(rawPK).getPublic().encode('hex', true);
        const keyEncoder = new key_encoder_1.default("secp256k1");
        const encodedPK = keyEncoder.encodePublic(hexPK, "raw", "pem");
        const result = jsonwebtoken_1.default.verify(token, encodedPK, {
            algorithms: ["ES256"]
        });
        done(null, result);
    }
    catch (error) {
        done(null, false);
    }
}));
app.get('/', (req, res) => {
    res.send('API Alive');
});
function getKey() {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var name = "";
    var charactersLength = characters.length;
    for (var i = 0; i < 8; i++) {
        name += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    var key = crypto_js_1.default.SHA256("live/" + name).toString();
    return key;
}
// Reset stream key
app.post('/stream', passport_1.default.authenticate('deso', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var key = getKey();
    var publicKey = req.body.PublicKeyBase58Check;
    var stream = yield db_1.StreamModel.findOneAndUpdate({
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
}));
// Get private stream data
app.get('/private/stream', passport_1.default.authenticate('deso', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const publicKey = req.headers['publickeybase58check'];
    var stream = yield db_1.StreamModel.findOne({
        publicKey
    });
    if (!stream) {
        var key = getKey();
        stream = yield db_1.StreamModel.create({
            publicKey,
            key: key
        });
        stream.save();
    }
    res.json({
        stream: Object.assign(Object.assign({}, stream), { streamKey: `${stream._id}?pwd=${stream.key}` })
    });
}));
app.get('/streams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const streams = yield db_1.StreamModel.find({}, '-key');
    res.send({
        streams
    });
}));
app.get('/streams/live', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const streams = yield db_1.StreamModel.find({
        isLive: true
    }, '-key');
    res.send({
        streams
    });
}));
app.get('/streams/live/one', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stream = yield db_1.StreamModel.findOne({
        isLive: true
    }, '-key');
    res.send({
        stream
    });
}));
app.get('/stream/:publicKey/info', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stream = yield db_1.StreamModel.findOne({
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
}));
// Update Stream Info
app.post('/stream/info', passport_1.default.authenticate('deso', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var publicKey = req.body.PublicKeyBase58Check;
    const stream = yield db_1.StreamModel.findOneAndUpdate({
        publicKey
    }, {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
    });
    console.log(req.body);
    const fuckingOld = yield db_1.CategoryModel.updateOne({
        streams: stream._id,
    }, {
        $pullAll: {
            streams: [stream._id]
        }
    });
    const newShit = yield db_1.CategoryModel.updateOne({
        _id: req.body.category,
        streams: {
            $ne: stream._id
        }
    }, {
        $push: {
            streams: stream._id
        }
    });
    res.json({ stream });
}));
app.get('/stream/:pubkey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stream = yield db_1.StreamModel.findOne({
        publicKey: req.params.pubkey
    }, '-key');
    if (stream && stream.category) {
        yield stream.populate('category');
    }
    res.send({
        stream
    });
}));
// PublicKey is of the streamer
app.post('/follow/:publicKey', passport_1.default.authenticate('deso', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var publicKey = req.body.PublicKeyBase58Check;
    // Check that personFollowing exists
    yield db_1.ViewerModel.findOneAndUpdate({
        publicKey
    }, {}, {
        upsert: true
    });
    // Check that personFollowed exists
    yield db_1.ViewerModel.findOneAndUpdate({
        publicKey: req.params.publicKey
    }, {}, {
        upsert: true
    });
    // Check if following already, and push
    const personFollowing = yield db_1.ViewerModel.updateOne({
        publicKey,
        following: {
            $ne: req.params.publicKey
        }
    }, {
        $push: {
            following: req.params.publicKey
        },
        $inc: {
            totalFollowing: 1
        }
    });
    const personFollowed = yield db_1.ViewerModel.updateOne({
        publicKey: req.params.publicKey,
        followers: {
            $ne: publicKey
        }
    }, {
        $push: {
            followers: publicKey
        },
        $inc: {
            totalFollowers: 1
        }
    });
    res.json({
        personFollowing,
        personFollowed
    });
}));
// Public key is of the personFollowing, will not be required after Auth implemented
app.get('/following', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const publicKey = req.headers['publickeybase58check'];
    const personFollowing = yield db_1.ViewerModel.findOne({
        publicKey
    });
    res.json({
        following: (personFollowing) ? personFollowing.following : []
    });
}));
// Public key is of the personFOllowed, will not be required after Auth implemented
app.get('/followers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const publicKey = req.headers['publickeybase58check'];
    const personFollowed = yield db_1.ViewerModel.findOne({
        publicKey
    });
    res.json({
        followers: (personFollowed) ? personFollowed.followers : []
    });
}));
app.post('/unfollow/:pubicKey', passport_1.default.authenticate('deso', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var publicKey = req.body.PublicKeyBase58Check;
    // Update personFollowing
    const personFollowing = yield db_1.ViewerModel.updateOne({
        publicKey
    }, {
        $pullAll: {
            following: [req.params.pubicKey]
        },
        $inc: {
            totalFollowing: -1
        }
    });
    // Update personFollowed
    const personFollowed = yield db_1.ViewerModel.updateOne({
        publicKey: req.params.pubicKey
    }, {
        $pullAll: {
            followers: [publicKey]
        },
        $inc: {
            totalFollowers: -1
        }
    });
    res.send({
        personFollowing, personFollowed
    });
}));
app.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield db_1.CategoryModel.find();
    res.send({
        categories
    });
}));
function isStream(obj) {
    return (obj && obj.key);
}
app.get('/category/:category', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fuckYou = yield db_1.CategoryModel.findById(req.params.category);
        if (fuckYou) {
            yield db_1.CategoryModel.findById(req.params.category).populate('streams').exec((err, category) => {
                if (category.streams) {
                    var streams = category.streams.map((stream) => {
                        if (isStream(stream)) {
                            if (stream.isLive) {
                                return stream;
                            }
                        }
                    });
                    res.json({
                        streams: streams
                    });
                }
                else {
                    res.json({
                        streams: null,
                        fuck: true
                    });
                }
            });
        }
        else {
            res.send('Fuck off');
        }
    }
    catch (e) {
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
}));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.DBURL, {});
        const socketBridge = new bridge_1.default();
        function updateViewCount(pubKey, count) {
            return __awaiter(this, void 0, void 0, function* () {
                const viewer = yield db_1.StreamModel.findOneAndUpdate({
                    publicKey: pubKey
                }, {
                    viewerCount: count
                });
            });
        }
        socketBridge.onDisconnect((topic, count) => {
            if (topic.substring(1, 5) == "chat") {
                updateViewCount(topic.substring(6), count);
            }
            console.log('topic ', topic, ' has ', count);
        });
        socketBridge.onConnect((topic, count) => {
            if (topic.substring(1, 5) == "chat") {
                updateViewCount(topic.substring(6), count);
            }
            console.log('topic ', topic, ' has ', count);
        });
        socketBridge.start();
        app.listen(port, (err) => {
            if (err) {
                return console.error(err);
            }
            return console.log(`API on ${port}`);
        });
    });
}
run().catch(err => console.log(err));
//# sourceMappingURL=app.js.map