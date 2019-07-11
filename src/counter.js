import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  numerator: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  period: {
    type: Date,
    required: false,
    default: null
  },
  group: {
    type: mongoose.Schema.Types.Mixed,
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
  period: 1,
  group: 1
});

async function getNext(numerator, period, group) {
  const Counter = this;
  const filter = { numerator, period, group };
  const update = { $inc: { count: 1 } };
  const counter = await Counter.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true
  });
  return counter.count;
}

schema.statics.getNext = getNext;

export default mongoose.model('__AutoNumberCounter', schema);
