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

const config = require('@adobe/aio-lib-core-config')
const exchange = require('@adobe/aemcs-api-client-lib')
const { SDKError } = require('./errors')

/**
 * Returns a Promise that resolves with a credentials JSON data.
 *
 * @param {string} aioConfigKey - aio config key
 * @returns {Promise<any>} the response body wrapped inside a Promise
 */
async function getToken (aioConfigKey) {
  const configString = config.get(aioConfigKey)

  if (!configString) {
    console.log('config not found')
    return
  }

  let serviceToken = null
  try {
    serviceToken = JSON.parse(configString)
  } catch (error) {
    console.log('not parsed')
  }

  if (!serviceToken) {
    // Treat config as a DEV token
    return {
      accessToken: configString,
      type: 'Bearer',
      expires: 24 * 60 * 60 * 1000
    }
  }

  return exchange(serviceToken)
    .then(data => {
      return {
        accessToken: data.access_token,
        type: data.token_type,
        expires: data.expires_in
      }
    })
    .catch(error => {
      const { name, type, message, details } = error
      throw new SDKError(name, type || 'Exchange Token', '', message, details)
    })
}

module.exports = getToken
