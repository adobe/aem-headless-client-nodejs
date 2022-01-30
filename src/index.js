/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { HttpExponentialBackoff } = require('@adobe/aio-lib-core-networking')
const AEMHeadlessApi = require('@adobe/aem-headless-client-js') // eslint-disable-line
const getToken = require('./utils/auth')

/**
 * This class provides methods to call AEM GraphQL APIs.
 * Before calling any method initialize the instance
 * with GraphQL endpoint, GraphQL serviceURL and auth if needed
 */
class AEMHeadless extends AEMHeadlessApi {
  /**
   * Constructor.
   *
   * If param is a string, it's treated as AEM server URL, default GraphQL endpoint is used.
   * For granular params, use config object
   *
   * @param {string|object} config - Configuration object, or AEM server URL string
   * @param {string} [config.serviceURL] - AEM server URL
   * @param {string} [config.endpoint] - GraphQL endpoint
   * @param {(string|Array)} [config.auth] - Bearer token string or [user,pass] pair array
   * @param {object} [config.fetch] - custom Fetch instance - default @adobe/aio-lib-core-networking
   */
  constructor (config) {
    const fetchRetry = new HttpExponentialBackoff()
    const fetch = config.fetch || fetchRetry.exponentialBackoff.bind(fetchRetry)
    let extendedConfig = {
      fetch
    }

    if (typeof config !== 'string') {
      extendedConfig = {
        fetch,
        ...config
      }
    } else {
      extendedConfig.serviceURL = config
    }

    super(extendedConfig)
  }
}
module.exports = AEMHeadless
module.exports.getToken = getToken
module.exports.AEMHeadless = AEMHeadless
