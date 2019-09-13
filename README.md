# @safer-bwd/mongoose-autonumber
[![Build Status](https://travis-ci.com/safer-bwd/mongoose-autonumber.svg?branch=master)](https://travis-ci.com/safer-bwd/mongoose-autonumber)

A Mongoose plugin that adds support for *auto-increment* or *auto-number* fields to a Mongoose schema.
The plugin supports numbering inside groups and periods.

## Install

```sh
npm install @safer-bwd/mongoose-autonumber --save
```

## Options

-   `counterName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The Mongoose model name for storing counters (optional, default `__Counter`)

## Settings

The plugin adds an option `autonumber` for [String](https://mongoosejs.com/docs/schematypes.html#strings) or [Number](https://mongoosejs.com/docs/schematypes.html#numbers) schema types.

-   `autonumber` **([boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))**  (optional, default `false`)
    -   `autonumber.numerator` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The counter name (optional)
    -   `autonumber.group` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function))** The path to a Mongoose document grouping property or function to calculate the group (optional)
    -   `autonumber.period` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The periodicity of numbering. Used only with *autonumber.date* (optional, available values `year`, `month`, `day`, `hour`, `minute`)
    -   `autonumber.date` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function))** The path to a Mongoose document date property or function to calculate the date. Used only with *autonumber.period* (optional)
    -   `autonumber.prefix` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function))** The path to a Mongoose document prefix property or function to calculate the prefix. Used only with [String](https://mongoosejs.com/docs/schematypes.html#strings) schema type (optional)
    -   `autonumber.addLeadingZeros` **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** The flag, If true then leading zeros are added. Used only with [String](https://mongoosejs.com/docs/schematypes.html#strings) schema type (optional)
    -   `autonumber.length` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number length. Used only with [String](https://mongoosejs.com/docs/schematypes.html#strings) schema type and *autonumber.addLeadingZeros* (optional, default `10`)

## Usage

### Auto increment

```javascript
import autoNumberPlugin from '@safer-bwd/mongoose-autonumber';
  
const schema = new mongoose.Schema({
  number: {
    type: Number,
    autonumber: true 
  }
});
schema.plugin(autoNumberPlugin);
const Order = mongoose.model('Order', schema);

const order1 = new Order();
await order1.save(); // number => 1
const order2 = new Order();
await order2.save(); // number => 2
```

### Increment inside group

```javascript
import autoNumberPlugin from '@safer-bwd/mongoose-autonumber';
  
const schema = new mongoose.Schema({
  customer: String,
  number: {
    type: Number,
    autonumber: {
      group: doc => doc.customer 
    }
  }
});
schema.plugin(autoNumberPlugin);
const Order = mongoose.model('Order', schema);

const order1 = new Order({ customer: 'A' });
await order1.save(); // number => 1
const order2 = new Order({ customer: 'A' });
await order2.save(); // number => 2
const order3 = new Order({ customer: 'B' });
await order3.save(); // number => 1
```

### Increment inside period

```javascript
import autoNumberPlugin from '@safer-bwd/mongoose-autonumber';
  
const schema = new mongoose.Schema({
  period: Date,
  number: {
    type: Number,
    autonumber: {
        period: 'year',
        date: doc => doc.period
    }
  }
});
schema.plugin(autoNumberPlugin);
const Order = mongoose.model('Order', schema);

const order1 = new Order({ period: new Date(2019, 0, 1) });
await order1.save(); // number => 1
const order2 = new Order({ period: new Date(2019, 0, 2) });
await order2.save(); // number => 2
const order3 = new Order({ period: new Date(2020, 0, 1) });
await order3.save(); // number => 1
```

### Prefix and adding leading zeros

```javascript
import autoNumberPlugin from '@safer-bwd/mongoose-autonumber';
  
const schema = new mongoose.Schema({
  customer: String,
  number: {
    type: String,
    autonumber: {
      prefix: doc => `${doc.customer}-`,
      addLeadingZeros: true,
      length: 6
    }
  }
});
schema.plugin(autoNumberPlugin);
const Order = mongoose.model('Order', schema);

const order1 = new Order({ customer: 'A' });
await order1.save(); // number => 'A-0001'
const order2 = new Order({ customer: 'A' });
await order2.save(); // number => 'A-0002'
const order3 = new Order({ customer: 'B' });
await order3.save(); // number => 'B-0003'
```
