"use strict";
exports.__esModule = true;
exports.StreamModel = void 0;
var mongoose_1 = require("mongoose");
;
var schema = new mongoose_1.Schema({
    key: {
        required: true,
        type: String
    },
    publicKey: {
        require: true,
        type: String
    },
    title: {
        type: String,
        "default": ''
    },
    description: {
        type: String,
        "default": ''
    },
    category: {
        type: 'ObjectId',
        ref: 'Category'
    },
    isLive: {
        type: Boolean,
        "default": false
    },
    viewerCount: {
        type: Number,
        "default": 0
    },
    messages: [{
            user: String,
            message: String
        }]
});
var StreamModel = (0, mongoose_1.model)('Stream', schema);
exports.StreamModel = StreamModel;
exports["default"] = StreamModel;
//# sourceMappingURL=stream.js.map