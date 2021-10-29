import { Schema, model } from 'mongoose';

interface Viewer {
    username: string;
    publicKey: string; // Temp
    following: [string];
};

const schema = new Schema<Viewer>({
    username: {
        type: String
    },
    publicKey: {
        type: String,
        required: true
    },
    following: {
        type: [String]
    }
});

const ViewerModel = model<Viewer>('Viewer', schema);

export default ViewerModel;
export {
  ViewerModel,
  Viewer
};

