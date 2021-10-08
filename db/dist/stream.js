"use strict";
exports.__esModule = true;
exports.StreamModel = void 0;
var mongoose_1 = require("mongoose");
;
var schema = new mongoose_1.Schema({
    key: {
        required: true,
        type: String,
        select: false
    },
    publicKey: {
        require: true,
        type: String
    }
});
var StreamModel = (0, mongoose_1.model)('Stream', schema);
exports.StreamModel = StreamModel;
exports["default"] = StreamModel;
//# sourceMappingURL=stream.js.map