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
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3123;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('API Alive');
});
app.post('/stream', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var name = "";
    var charactersLength = characters.length;
    for (var i = 0; i < 8; i++) {
        name += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    var key = crypto_js_1.default.SHA256("live/" + name).toString();
    var publicKey = req.body.publicKey;
    var stream = yield db_1.StreamModel.findOneAndUpdate({
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
}));
app.get('/streams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const streams = yield db_1.StreamModel.find();
    res.send({
        streams
    });
}));
app.get('/stream/:pubkey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stream = yield db_1.StreamModel.findOne({
        publicKey: req.params.pubkey
    });
    res.send({
        stream
    });
}));
// PublicKey is of the streamer
app.post('/follow/:publicKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check that viewer exists
    yield db_1.ViewerModel.findOneAndUpdate({
        publicKey: req.body.publicKey
    }, {}, {
        upsert: true
    });
    // Check if following already, and push
    const followers = yield db_1.ViewerModel.updateOne({
        publicKey: req.body.publicKey,
        following: {
            $ne: req.params.publicKey
        }
    }, {
        $push: {
            following: req.params.publicKey
        },
    });
    res.json({
        followers
    });
}));
// Public key is of the viewer, will not be required after Auth implemented
app.get('/following/:publicKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const following = yield db_1.ViewerModel.findOne({
        publicKey: req.params.publicKey
    });
    res.json({
        following: (following) ? following.following : false
    });
}));
// app.post('/stream', (req, res) => {
// });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.DBURL, {});
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