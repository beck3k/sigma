import { Schema, model, PopulatedDoc } from 'mongoose';
import { Stream } from './stream';

interface Category {
    name: string;
    streams: PopulatedDoc<Stream & Document>[];
    imgUrl: string;
};

const schema = new Schema<Category>({
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

const CategoryModel = model<Category>('Category', schema);

export default CategoryModel;
export {
  CategoryModel,
  Category
};

