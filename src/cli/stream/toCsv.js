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
  let fileDst;

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

    if (!fileDst) {
      fileDst = fs.createWriteStream(filename, { encoding });
    }
    fileDst.write(csv);
  };

  return {
    push,
    close: () => {
      if (fileDst) fileDst.close();
    },
  };
}

module.exports = toCsv;
