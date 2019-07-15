const mongoose = require('mongoose');
const autoNumber = require('../src');

beforeAll(async () => {
  await mongoose.connect(process.env.DB_MONGO_URI, {
    auth: (process.env.DB_MONGO_USER) ? {
      user: process.env.DB_MONGO_USER,
      password: process.env.DB_MONGO_PASSWORD
    } : null,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  delete mongoose.models.Order;
  await mongoose.connection.dropDatabase();
});

it('should auto increment', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autonumber: true
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();
  const order2 = new Order();
  await order2.save();
  const order3 = new Order();
  await order3.save();

  expect(order1.number).toBe(1);
  expect(order2.number).toBe(2);
  expect(order3.number).toBe(3);
});

it('should increment inside group #1', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autonumber: {
        group: 'customer.name'
      }
    },
    customer: {
      name: {
        type: String,
        required: true
      }
    },
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ customer: { name: 'customer1' } });
  await order1.save();
  const order2 = new Order({ customer: { name: 'customer2' } });
  await order2.save();
  const order3 = new Order({ customer: { name: 'customer1' } });
  await order3.save();

  expect(order1.number).toBe(1);
  expect(order2.number).toBe(1);
  expect(order3.number).toBe(2);
});

it('should increment inside group #2', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autonumber: {
        group: doc => doc.customer.name
      }
    },
    customer: {
      name: {
        type: String,
        required: true
      }
    },
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ customer: { name: 'customer1' } });
  await order1.save();
  const order2 = new Order({ customer: { name: 'customer2' } });
  await order2.save();
  const order3 = new Order({ customer: { name: 'customer1' } });
  await order3.save();

  expect(order1.number).toBe(1);
  expect(order2.number).toBe(1);
  expect(order3.number).toBe(2);
});

it('should increment inside period #1', async () => {
  const schema = new mongoose.Schema({
    period: {
      type: Date,
      required: true
    },
    number: {
      type: Number,
      autonumber: {
        period: 'year',
        date: 'period'
      }
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ period: new Date(2019, 0, 1) });
  await order1.save();
  const order2 = new Order({ period: new Date(2019, 0, 1) });
  await order2.save();
  const order3 = new Order({ period: new Date(2020, 0, 1) });
  await order3.save();

  expect(order1.number).toBe(1);
  expect(order2.number).toBe(2);
  expect(order3.number).toBe(1);
});

it('should increment inside period #2', async () => {
  const schema = new mongoose.Schema({
    period: {
      type: Date,
      required: true
    },
    number: {
      type: Number,
      autonumber: {
        period: 'year',
        date: doc => doc.period
      }
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ period: new Date(2019, 0, 1) });
  await order1.save();
  const order2 = new Order({ period: new Date(2019, 0, 1) });
  await order2.save();
  const order3 = new Order({ period: new Date(2020, 0, 1) });
  await order3.save();

  expect(order1.number).toBe(1);
  expect(order2.number).toBe(2);
  expect(order3.number).toBe(1);
});

it('should add prefix #1', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: String,
      autonumber: {
        prefix: 'store.prefix'
      }
    },
    store: {
      prefix: {
        type: String,
        required: true
      }
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ store: { prefix: 'S1-' } });
  await order1.save();
  const order2 = new Order({ store: { prefix: 'S2-' } });
  await order2.save();
  const order3 = new Order({ store: { prefix: 'S1-' } });
  await order3.save();

  expect(order1.number).toBe('S1-1');
  expect(order2.number).toBe('S2-2');
  expect(order3.number).toBe('S1-3');
});

it('should add prefix #2', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: String,
      autonumber: {
        prefix: doc => `${doc.store.name}-`
      }
    },
    store: {
      name: {
        type: String,
        required: true
      }
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ store: { name: 'store1' } });
  await order1.save();
  const order2 = new Order({ store: { name: 'store2' } });
  await order2.save();
  const order3 = new Order({ store: { name: 'store1' } });
  await order3.save();

  expect(order1.number).toBe('store1-1');
  expect(order2.number).toBe('store2-2');
  expect(order3.number).toBe('store1-3');
});

it('should add leading zeros #1', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: String,
      autonumber: {
        addLeadingZeros: true,
        length: 5
      }
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();
  const order2 = new Order();
  await order2.save();
  const order3 = new Order();
  await order3.save();

  expect(order1.number).toBe('00001');
  expect(order2.number).toBe('00002');
  expect(order3.number).toBe('00003');
});

it('should add leading zeros #2', async () => {
  const schema = new mongoose.Schema({
    prefix: {
      type: String,
      required: true
    },
    number: {
      type: String,
      autonumber: {
        prefix: doc => `${doc.prefix}-`,
        addLeadingZeros: true,
        length: 6
      }
    }
  });
  schema.plugin(autoNumber);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order({ prefix: 'AA' });
  await order1.save();
  const order2 = new Order({ prefix: 'AA' });
  await order2.save();
  const order3 = new Order({ prefix: 'AB' });
  await order3.save();

  expect(order1.number).toBe('AA-001');
  expect(order2.number).toBe('AA-002');
  expect(order3.number).toBe('AB-003');
});
