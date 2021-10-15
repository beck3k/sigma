import { Schema, model, PopulatedDoc, Document } from 'mongoose';
import { Category } from './category';

interface Stream {
  key: string;
  publicKey: string;
  title: string;
  description: string;
  category: PopulatedDoc<Category & Document>;
  isLive: boolean;
  viewerCount: number;
};

const schema = new Schema<Stream>({
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
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: 'ObjectId',
    ref: 'Category'
  },
  isLive: {
    type: Boolean,
    default: false
  },
  viewerCount: {
    type: Number,
    default: 0
  }
});

const StreamModel = model<Stream>('Stream', schema);

export default StreamModel;
export {
  StreamModel,
  Stream
};

