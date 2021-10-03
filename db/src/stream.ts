import { Schema, model } from 'mongoose';

interface Stream {
  name: string;
  key: string;
};

const schema = new Schema<Stream>({
  name: {
    required: true,
    type: String
  },
  key: {
    required: true,
    type: String
  }
});

const StreamModel = model<Stream>('Stream', schema);

export default StreamModel;
export {
  StreamModel,
  Stream
};

