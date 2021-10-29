"use strict";
exports.__esModule = true;
exports.ViewerModel = void 0;
var mongoose_1 = require("mongoose");
;
var schema = new mongoose_1.Schema({
    username: {
        type: String
    },
    publicKey: {
        type: String,
        required: true
    },
    following: {
        type: [String]
    },
    followers: {
        type: [String]
    },
    totalFollowing: {
        type: Number,
        "default": 0
    },
    totalFollowers: {
        type: Number,
        "default": 0
    }
});
var ViewerModel = (0, mongoose_1.model)('Viewer', schema);
exports.ViewerModel = ViewerModel;
exports["default"] = ViewerModel;
//# sourceMappingURL=viewers.js.map