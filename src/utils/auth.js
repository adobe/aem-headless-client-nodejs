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

const fs = require('fs')
const path = require('path')
const exchange = require('@adobe/aemcs-api-client-lib')
const { ErrorCodes } = require('@adobe/aem-headless-client-js')
const { AUTH_FILE_READ_ERROR, AUTH_FILE_PARSE_ERROR, EXCHANGE_TOKEN_ERROR } = ErrorCodes
const loggerNamespace = 'aem-headless-client-nodejs'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { level: process.env.LOG_LEVEL })

/**
 * Returns a Promise that resolves with a credentials JSON data.
 *
 * @param {string} credentialsFilePath - credentials config file path (serviceToken or devToken content)
 * @returns {Promise<any>} the response body wrapped inside a Promise
 */
async function getToken (credentialsFilePath) {
  let authFileContent = ''

  try {
    const filePath = path.isAbsolute(credentialsFilePath) ? credentialsFilePath : path.join(process.cwd(), credentialsFilePath)
    authFileContent = fs.readFileSync(filePath, 'utf8')
    logger.debug('auth file read successfully')
  } catch (error) {
    logger.debug('auth file read error', error)
    throw new AUTH_FILE_READ_ERROR({
      messageValues: error.message
    })
  }

  let config = null
  try {
    config = JSON.parse(authFileContent)
    logger.debug('auth file parsed successfully')
  } catch (error) {
    logger.debug('auth file parse error', error)
    throw new AUTH_FILE_PARSE_ERROR({
      messageValues: error.message
    })
  }

  if (config.accessToken) {
    // If config has DEV token
    return {
      accessToken: config.accessToken,
      type: 'Bearer',
      expires: 24 * 60 * 60 * 1000
    }
  }

  return exchange(config)
    .then(data => {
      logger.debug('exchange token success')
      return {
        accessToken: data.access_token,
        type: data.token_type,
        expires: data.expires_in
      }
    })
    .catch(error => {
      logger.debug('exchange token error', error)
      throw new EXCHANGE_TOKEN_ERROR({
        messageValues: error.message
      })
    })
}

module.exports = getToken
