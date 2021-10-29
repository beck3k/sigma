"use strict";
exports.__esModule = true;
exports.CategoryModel = void 0;
var mongoose_1 = require("mongoose");
;
var schema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    streams: [{
            type: 'ObjectId',
            ref: 'Stream'
        }],
    imgUrl: {
        type: String,
        required: true
    }
});
var CategoryModel = (0, mongoose_1.model)('Category', schema);
exports.CategoryModel = CategoryModel;
exports["default"] = CategoryModel;
//# sourceMappingURL=category.js.map