const { EventEmitter } = require('events');
const papa = require('papaparse');
const getMap = require('./getMap');

const { config } = require('../../client/config');

function invoiceWorker(params = {}) {
  const {
    source,
    push = () => { },
  } = params;
  let lastRecord;

  const map = getMap({ source });

  return {
    group: (row) => {
      const data = map.fromRecord(row.data);
      const col = 'EisUniqueId';

      const id = (lastRecord || {})[col];
      if (lastRecord && data[col] !== id) {
        push(lastRecord);
        lastRecord = null;
      }
      else if (lastRecord
        && Array.isArray(lastRecord.ItemList)
        && Array.isArray(data.ItemList)) {
        lastRecord.ItemList.push(...data.ItemList);
      }
      else if (!lastRecord) lastRecord = data;
    },
    getLastRecord: () => lastRecord,
  };
}

function transformCsv(fileStream, params = {}) {
  const {
    source,
    encoding = 'utf8',
  } = params;

  const event = new EventEmitter();
  const emitInvoice = (inv) => event.emit('data', inv);

  const worker = invoiceWorker({ source, push: emitInvoice });
  // start parsing
  fileStream.on('close', () => {
    emitInvoice(worker.getLastRecord());
    event.emit('close');
  });

  papa.parse(fileStream, {
    header: true,
    encoding,
    skipEmptyLines: true,
    ...(config.csvOptions || {}),
    step: worker.group,
  });

  return event;
}

module.exports = transformCsv;
