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
const https = require('https')
const qs = require('querystring')
const jwt = require('jsonwebtoken')
const { ErrorCodes } = require('@adobe/aem-headless-client-js')
const { AUTH_FILE_READ_ERROR, AUTH_FILE_PARSE_ERROR, EXCHANGE_TOKEN_ERROR } = ErrorCodes
const loggerNamespace = 'aem-headless-client-nodejs'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { level: process.env.LOG_LEVEL })

/**
 * Exchange JWT token for access token using native Node.js HTTPS
 *
 * @param {object} config - service token configuration object
 * @returns {Promise<object>} Promise that resolves to token data
 */
async function exchangeJwtToken (config) {
  const options = {
    issuer: config.integration.org,
    subject: config.integration.id,
    expiration_time_seconds: Math.floor((Date.now() / 1000) + 3600 * 8),
    metascope: config.integration.metascopes.split(','),
    client_id: config.integration.technicalAccount.clientId,
    client_secret: config.integration.technicalAccount.clientSecret,
    privateKey: config.integration.privateKey,
    imsHost: config.integration.imsEndpoint
  }

  const jwtPayload = {
    iss: options.issuer,
    sub: options.subject,
    exp: options.expiration_time_seconds,
    aud: `https://${options.imsHost}/c/${options.client_id}`
  }

  // Add metascopes to JWT payload
  options.metascope.forEach((scope) => {
    jwtPayload[`https://${options.imsHost}/s/${scope}`] = true
  })

  // Create JWT token
  const jwtToken = jwt.sign(jwtPayload, options.privateKey, { algorithm: 'RS256' })

  const body = qs.stringify({
    client_id: options.client_id,
    client_secret: options.client_secret,
    jwt_token: jwtToken
  })

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: options.imsHost,
      method: 'POST',
      path: '/ims/exchange/jwt',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.error_description || data}`))
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`))
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.write(body)
    req.end()
  })
}

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

  // If config has service token configuration, exchange JWT for access token
  try {
    const data = await exchangeJwtToken(config)
    logger.debug('exchange token success')
    return {
      accessToken: data.access_token,
      type: data.token_type,
      expires: data.expires_in
    }
  } catch (error) {
    logger.debug('exchange token error', error)
    throw new EXCHANGE_TOKEN_ERROR({
      messageValues: error.message
    })
  }
}

module.exports = getToken
