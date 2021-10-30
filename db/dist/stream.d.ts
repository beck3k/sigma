import { PopulatedDoc, Document } from 'mongoose';
import { Category } from './category';
interface Message {
    user: String;
    message: String;
}
interface Stream {
    key: string;
    publicKey: string;
    title: string;
    description: string;
    category: PopulatedDoc<Category & Document>;
    isLive: boolean;
    viewerCount: number;
    messages: Message[];
}
declare const StreamModel: import("mongoose").Model<Stream, {}, {}, {}>;
export default StreamModel;
export { StreamModel, Stream };
//# sourceMappingURL=stream.d.ts.map