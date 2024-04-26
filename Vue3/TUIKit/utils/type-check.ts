const objectToString = Object.prototype.toString;
const toTypeString = (value: any) => objectToString.call(value);

export const { isArray } = Array;
export const isMap = (val: any) => toTypeString(val) === '[object Map]';
export const isSet = (val: any) => toTypeString(val) === '[object Set]';
export const isDate = (val: any) => val instanceof Date;
export const isFunction = (val: any) => typeof val === 'function';
export const isString = (val: any) => typeof val === 'string';
export const isSymbol = (val: any) => typeof val === 'symbol';
export const isObject = (val: any) => val !== null && typeof val === 'object';
export const isPromise = (val: any) =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch);
// Determine whether it is url
export const isUrl = (url: string) => {
  return /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(
    url,
  );
};

// Determine if it is a JSON string
export const isJSON = (str: string) => {
  // eslint-disable-next-line no-useless-escape
  if (typeof str === 'string') {
    try {
      const data = JSON.parse(str);
      if (data) {
        return true;
      }
      return false;
    } catch (error: any) {
      return false;
    }
  }
  return false;
};

// Determine if it is a JSON string
export const JSONToObject = (str: string) => {
  if (!str || !isJSON(str)) {
    return str;
  }
  return JSON.parse(str);
};
