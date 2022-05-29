const fastq = require('fastq');
const fs = require('fs');
const log = require('loglevel');
const fns = require('date-fns');

const transformCsv = require('./transformCsv');
const { authorize, sendInvoices } = require('../../client');
const toCsv = require('../stream/toCsv');

const stats = {};

function getWorker({ source }) {
  const queue = fastq.promise(sendInvoices, 1000);
  const storage = [];
  stats.batch = 0;
  stats.invoice = 0;
  stats.error = 0;
  stats.success = 0;

  const date = fns.format(new Date(), 'yyyyMMdd_HHmmss_SSS');
  if (!fs.existsSync('output')) fs.mkdirSync('output', { recursive: true });

  const processed = toCsv({
    filename: `output/${date}-processed.csv`,
    fields: ['refId', 'CompInvoiceId', 'EisUniqueId', 'IssueDtm'],
  });
  const success = toCsv({
    filename: `output/${date}-success.csv`,
    fields: ['refSubmitId', 'accreditationId', 'userId', 'ackId', 'responseDtm', 'description'],
  });
  const error = toCsv({
    filename: `output/${date}-error.csv`,
    fields: ['refId', 'apiStatusCode', 'apiStatusText', 'errorMessage', 'errorCode'],
  });

  const push = (d) => {
    stats.batch += 1;
    return queue.push({ source, data: d, throwErrors: false })
      .then((r) => {
        processed.push(d.map((x) => ({ ...x, refId: r.refId })));
        if (!r.hasError) {
          stats.success += 1;
          success.push(r.data);
        } else {
          stats.error += 1;
          error.push({
            ...d,
            ...r,
          });
        }
      });
  };

  return {
    batch: (inv) => {
      stats.invoice += 1;
      storage.push(inv);
      if (storage.length > 100) {
        stats.batch += 1;
        const data = storage.splice(0, 100);
        push(data);
      }
    },
    close: () => {
      push(storage);
    },
  };
}

async function runCmd(opts) {
  const source = String(opts.source).toUpperCase();
  const fileStream = fs.createReadStream(opts.file);

  stats.start = new Date();
  let worker;
  let invoiceFn;
  if (!opts.dryrun) {
    await authorize();
    worker = getWorker({ source });
    invoiceFn = worker.batch;
  } else {
    invoiceFn = log.info;
  }

  const transform = transformCsv(fileStream, { source });
  const promise = new Promise((resolve) => {
    transform.on('close', () => resolve());
  });
  transform.on('data', invoiceFn);
  await promise;

  if (worker && worker.close) {
    await worker.close();
  }

  stats.end = new Date();
  stats.duration = stats.end.getTime() - stats.start.getTime();

  console.log(stats);
}

async function sendInvoicesCmd(cli) {
  cli.command('send-invoices')
    .description('Picks up a CSV file, convert to JSON, and send it')
    .requiredOption('--source [CAS|CRM|POS]', 'describe the source data')
    .requiredOption('--file [input.csv]', 'input csv file')
    .option('--map [mapping.json]', 'use a custom csv to json mapping file')
    .option('--dryrun', 'print only the invoices on screen')
    .action(runCmd);
}

module.exports = sendInvoicesCmd;
