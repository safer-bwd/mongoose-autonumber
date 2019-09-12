import mongoose from 'mongoose';
import schema from './schema';

export default name => mongoose.model(name, schema);
