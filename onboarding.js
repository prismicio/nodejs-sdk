const PrismicConfig = require('./prismic-configuration');
const request = require('request');

function trigger() {
  const endpoint = PrismicConfig.apiEndpoint.replace('/api', '');
  request.post(`${endpoint}/app/settings/onboarding/run`, { form: { language: 'node', framework: 'express' } });
}

module.exports = {
  trigger,
};
