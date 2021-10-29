import { Schema, model, PopulatedDoc } from 'mongoose';
import { Stream } from './stream';

interface Category {
    name: string;
    streams: PopulatedDoc<Stream & Document>[];
};

const schema = new Schema<Category>({
    name: {
        type: String,
        required: true
    },
    streams: [{
        type: 'ObjectId',
        ref: 'Stream'
    }]
});

const CategoryModel = model<Category>('Category', schema);

export default CategoryModel;
export {
  CategoryModel,
  Category
};

