import { Schema, model } from 'mongoose';

interface Stream {
  key: string;
  publicKey: string;
};

const schema = new Schema<Stream>({
  key: {
    required: true,
    type: String
  },
  publicKey: {
    require: true,
    type: String
  }
});

const StreamModel = model<Stream>('Stream', schema);

export default StreamModel;
export {
  StreamModel,
  Stream
};

