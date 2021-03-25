import { formatJson } from "../functions/formatJson";
import { getResultCount } from "./count";

export const xInY = async ({ x, y, result, ranks }) => {
  let params = {
    result,
    query: y,
    includeEstimates: false,
  };
  if (ranks) {
    params.query += ` AND tax_rank(${ranks})`;
    let field = y.replace(/[^\w_].+$/, "");
    params.includeEstimates = true;
    params.excludeAncestral = [field];
    params.excludeMissing = [field];
  }
  let yCount = await getResultCount(params);
  params.query += ` AND ${x}`;
  let xCount = await getResultCount(params);
  if (
    xCount.status &&
    xCount.status.success &&
    yCount.status &&
    yCount.status.success
  ) {
    return {
      status: { success: true },
      report: {
        xiny: xCount.count > 0 ? xCount.count / yCount.count : 0,
        x: xCount.count,
        y: yCount.count,
      },
    };
  }
};

module.exports = {
  getReport: async (req, res) => {
    let response = {};
    switch (req.query.report) {
      case "xiny": {
        response = await xInY({ ...req.query });
      }
    }
    if (response && response != {}) {
      return res.status(200).send(formatJson(response, req.query.indent));
    }
    return res.status(404).send({ status: "error" });
  },
};