const defCasMap = require('../template/defaultCasMap.json');

function mapper(map, data) {
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('data must be a valid object');
  }

  if (typeof map === 'object' && Array.isArray(map)) {
    const val = mapper(map[0], data);
    return [val];
  }

  if (typeof map === 'object') {
    const newData = {};
    Object.keys(map).forEach((key) => {
      const val = mapper(map[key], data);
      newData[key] = val;
    });
    return newData;
  }

  if (typeof map === 'string') {
    return data[map];
  }

  throw new Error('Invalid map');
}

function getMap(params = {}) {
  const {
    source,
    custom = {},
  } = params;
  if (!source) throw new Error(`Invalid source: ${source}`);

  let map;
  if (source === 'CAS') map = { ...defCasMap, ...custom };
  if (!map) throw new Error(`Invalid mapping: ${map}`);

  return {
    fromRecord: (record) => mapper(map, record),
  };
}

module.exports = getMap;
