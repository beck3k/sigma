import { PopulatedDoc } from 'mongoose';
import { Stream } from './stream';
interface Category {
    name: string;
    streams: PopulatedDoc<Stream & Document>[];
}
declare const CategoryModel: import("mongoose").Model<Category, {}, {}, {}>;
export default CategoryModel;
export { CategoryModel, Category };
//# sourceMappingURL=category.d.ts.map