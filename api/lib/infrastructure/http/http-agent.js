// eslint-disable-next-line no-restricted-modules
const axios = require('axios');
const { performance } = require('perf_hooks');

const config = require('../../config');

const monitoringTools = require('../monitoring-tools');

const TIMEOUT_MILLISECONDS = config.partner.fetchTimeOut;

class HttpResponse {
  constructor({ code, data, isSuccessful }) {
    this.code = code;
    this.data = data;
    this.isSuccessful = isSuccessful;
  }
}

module.exports = {
  async post({ url, payload, headers }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const httpResponse = await axios.post(url, payload, {
        headers,
        timeout: TIMEOUT_MILLISECONDS,
      });
      responseTime = performance.now() - startTime;
      monitoringTools.logInfoWithCorrelationIds({
        metrics: { responseTime },
        message: `End POST request to ${url} success: ${httpResponse.status}`,
      });

      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      let code = null;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        code = httpErr.code;
        data = httpErr.message;
      }

      const message = `End POST request to ${url} error: ${code || ''} ${JSON.stringify(data)}`;

      monitoringTools.logErrorWithCorrelationIds({
        metrics: { responseTime },
        message,
      });

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }
  },
  async get({ url, payload, headers }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const config = { data: payload, headers, timeout: TIMEOUT_MILLISECONDS };
      const httpResponse = await axios.get(url, config);
      responseTime = performance.now() - startTime;
      monitoringTools.logInfoWithCorrelationIds({
        metrics: { responseTime },
        message: `End GET request to ${url} success: ${httpResponse.status}`,
      });

      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      const isSuccessful = false;

      let code;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        code = '500';
        data = null;
      }

      monitoringTools.logErrorWithCorrelationIds({
        metrics: { responseTime },
        message: `End GET request to ${url} error: ${code || ''} ${JSON.stringify(data)}`,
      });

      return new HttpResponse({
        code,
        data,
        isSuccessful,
      });
    }
  },
};
