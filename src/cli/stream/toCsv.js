const papa = require('papaparse');
const fs = require('fs');

function toCsv(params = {}) {
  const {
    filename,
    fields,
    encoding = 'utf8',
    csvOptions,
  } = params;

  let header;
  const fileDst = fs.createWriteStream(filename, { encoding });

  const push = (data) => {
    // chunk is an object
    if (typeof data !== 'object') {
      throw new Error(`not an object: ${typeof data}`);
    }

    header = (header === undefined);
    const d = Array.isArray(data) ? data : [data];
    const csv = papa.unparse({ fields, data: d }, {
      header,
      ...csvOptions,
    });

    fileDst.write(csv);
  };

  return {
    push,
    close: () => fileDst.close(),
  };
}

module.exports = toCsv;
