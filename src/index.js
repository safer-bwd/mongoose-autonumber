import get from 'lodash.get';
import set from 'lodash.set';
import isPlainObject from 'lodash.isplainobject';
import makeCounter from './counter/make';
import startOfPeriod from './utils/start-of-period';
import isFunction from './utils/is-function';

let Counter;

const getAutonumberFields = (schema) => {
  const fields = [];

  schema.eachPath((path, schematype) => {
    const { options } = schematype;
    const { autonumber, type } = options;
    const isValidType = (type === Number || type === String);
    if (autonumber && isValidType) {
      fields.push({ path, options });
    }
  });

  return fields;
};

const setNumber = async (doc, field) => {
  const { path, options } = field;
  const { autonumber, type } = options;
  const autonumberOptions = isPlainObject(autonumber) ? autonumber : {};

  const {
    numerator,
    group,
    period,
    date = () => new Date()
  } = autonumberOptions;

  const { modelName } = doc.constructor;
  const numNumerator = numerator || `${modelName}.${path}`;
  const numGroup = isFunction(group) ? group(doc) : get(doc, group, null);
  const numDate = isFunction(date) ? date(doc) : get(doc, date, null);
  const numPeriod = period ? startOfPeriod(numDate, period) : null;
  const num = await Counter.getNext(numNumerator, numGroup, numPeriod);

  if (type === Number) {
    set(doc, path, num);
    return;
  }

  const { maxlength } = options;
  const {
    prefix = () => '',
    addLeadingZeros = false
  } = autonumberOptions;

  const numPrefix = isFunction(prefix) ? prefix(doc) : get(doc, prefix, '');
  const numSuffix = (addLeadingZeros && maxlength)
    ? String(num).padStart(maxlength - numPrefix.length, '0')
    : String(num);

  set(doc, path, `${numPrefix}${numSuffix}`);
};

export default (schema, options) => {
  const fields = getAutonumberFields(schema);
  if (fields.length === 0) {
    return;
  }

  const { counterName = '__Counter' } = options || {};
  Counter = makeCounter(counterName);
  schema.static('getCounterModel', () => Counter);

  async function setNumbers(next) {
    const doc = this;
    if (!doc.isNew) {
      next();
      return;
    }
    const promises = fields.map(field => setNumber(doc, field));
    await Promise.all(promises);
    next();
  }

  schema.pre('save', setNumbers);
};
