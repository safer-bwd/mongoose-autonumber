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

const retriveFromDoc = async (doc, retriver, defaultValue = null) => {
  if (!retriver) {
    return defaultValue;
  }

  let value;
  if (isFunction(retriver)) {
    value = await retriver(doc);
  } else {
    value = get(doc, retriver, defaultValue);
  }

  return value;
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
  const numGroup = await retriveFromDoc(doc, group);
  const numDate = await retriveFromDoc(doc, date);
  const numPeriod = period ? startOfPeriod(numDate, period) : null;
  const num = await Counter.getNext(numNumerator, numGroup, numPeriod);

  if (type === Number) {
    set(doc, path, num);
    return;
  }

  const {
    prefix = () => '',
    addLeadingZeros = false,
    length,
  } = autonumberOptions;

  const numPrefix = await retriveFromDoc(doc, prefix, '');
  const { maxlength = 10 } = options;
  const suffixLength = (length || maxlength) - numPrefix.length;
  const numStr = addLeadingZeros
    ? String(num).padStart(suffixLength, '0')
    : String(num);

  set(doc, path, `${numPrefix}${numStr}`);
};

export default (schema, options) => {
  const { counterName } = options || {};
  Counter = makeCounter(counterName);

  const fields = getAutonumberFields(schema);

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
