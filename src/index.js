import Counter from './counter';
import startOf from './utils/start-of';
import isFunction from './utils/is-function';

export default (schema, options = {}) => {
  const {
    field = 'number',
    fieldType = Number,
    numerator,
    period,
    group,
    prefix,
    dateField
  } = options;

  const pathType = schema.path(field);
  const pathOptions = pathType ? pathType.options || {} : {};
  const { type = fieldType } = pathOptions;

  schema.add({ [field]: { type } });

  async function setNumber(next) {
    const doc = this;
    if (!doc.isNew) {
      next();
      return;
    }

    const { modelName } = doc.constructor;
    const docNumerator = numerator || modelName;
    const docDate = dateField ? doc[dateField] : new Date();
    const docPeriod = period ? startOf(period, docDate) : null;
    let docGroup = null;
    if (group) {
      docGroup = isFunction(group) ? group(doc) : doc[group];
    }

    const count = await Counter.getNext(docNumerator, docPeriod, docGroup);

    if (type === Number) {
      doc[field] = count;
    } else {
      let docPrefix = '';
      if (prefix) {
        docPrefix = isFunction(prefix) ? prefix(doc) : prefix;
      }
      doc[field] = `${docPrefix}${count}`;
    }

    next();
  }

  schema.pre('save', setNumber);
};
