import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  numerator: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  group: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default: null
  },
  period: {
    type: Date,
    required: false,
    default: null
  },
  count: {
    type: Number,
    required: false,
    default: 0
  }
}, { id: false });

schema.index({
  numerator: 1,
  group: 1,
  period: 1
}, { unique: true });

schema.statics.getNext = async function (numerator, group, period) {
  const Counter = this;
  const filter = { numerator, period, group };
  const update = { $inc: { count: 1 } };
  const counter = await Counter.updateCurrent(filter, update);
  return counter.count;
};

schema.statics.getCurrent = async function (filter) {
  const Counter = this;
  const counter = await Counter.findOne(filter);
  return counter ? counter.count : 0;
};

schema.statics.setCurrent = async function (filter, value) {
  const Counter = this;
  const update = { count: value };
  await Counter.updateCurrent(filter, update);
};

schema.statics.updateCurrent = async function (filter, update) {
  const Counter = this;

  let counter;
  try {
    counter = await Counter.findOneAndUpdate(filter, update, { upsert: true, new: true });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      counter = await Counter.findOneAndUpdate(filter, update, { new: true });
    } else {
      throw err;
    }
  }

  return counter;
};

export default schema;
