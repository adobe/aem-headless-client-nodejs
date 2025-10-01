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
jest.mock('fs')
jest.mock('jsonwebtoken')
jest.mock('https')

const { getToken } = require('../src')

// /////////////////////////////////////////////
beforeAll(() => {
  fs.writeFileSync.mockClear()
  fs.readFileSync.mockReturnValue('{ "accessToken": "test" }')
})

beforeEach(() => {
  jest.clearAllMocks()
  fs.readFileSync.mockReturnValue('{ "accessToken": "test" }')
})

test('AUTH: should throw without params', () => {
  const promise = getToken()
  return expect(promise).rejects.toThrow('The "path" argument must be of type string. Received')
})

test('AUTH: should throw with invalid path', () => {
  const promise = getToken(123)
  return expect(promise).rejects.toThrow('The "path" argument must be of type string. Received')
})

test('AUTH: should pass with valid path', () => {
  const promise = getToken('test')
  return expect(promise).resolves.toBeTruthy()
})

test('AUTH: should throw with invalid file content', () => {
  fs.readFileSync.mockReturnValue('')
  const promise = getToken('test')
  return expect(promise).rejects.toThrow('Unexpected end of JSON input')
})

test('AUTH: should throw with invalid service token data', () => {
  const jwt = require('jsonwebtoken')
  jwt.sign.mockImplementation(() => {
    throw new Error('Invalid private key')
  })

  fs.readFileSync.mockReturnValue(`{
    "integration": {
      "imsEndpoint": "ims-na1.adobelogin.com",
      "metascopes": "ent_aem_cloud_sdk",
      "technicalAccount": {
        "clientId": "test_client_id",
        "clientSecret": "test_client_secret"
      },
      "id": "test@techacct.adobe.com",
      "org": "test@AdobeOrg",
      "privateKey": "invalid-key"
    }
  }`)
  const promise = getToken('test')
  return expect(promise).rejects.toThrow()
})

test('AUTH: should use service token', () => {
  const https = require('https')
  const jwt = require('jsonwebtoken')

  // Mock jwt.sign to return a dummy token
  jwt.sign.mockReturnValue('mock-jwt-token')

  // Mock https.request
  const mockRequest = {
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn()
  }

  https.request.mockImplementation((options, callback) => {
    // Simulate successful response
    process.nextTick(() => {
      const mockResponse = {
        statusCode: 200,
        setEncoding: jest.fn(),
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            handler('{"access_token":"test_token","token_type":"Bearer","expires_in":3600}')
          } else if (event === 'end') {
            handler()
          }
        })
      }
      callback(mockResponse)
    })
    return mockRequest
  })

  fs.readFileSync.mockReturnValue(`{
    "integration": {
      "imsEndpoint": "ims-na1.adobelogin.com",
      "metascopes": "ent_aem_cloud_sdk",
      "technicalAccount": {
        "clientId": "test_client_id",
        "clientSecret": "test_client_secret"
      },
      "id": "test@techacct.adobe.com",
      "org": "test@AdobeOrg",
      "privateKey": "-----BEGIN RSA PRIVATE KEY-----\\nMIIEpAIBAAKCAQEA\\n-----END RSA PRIVATE KEY-----"
    }
  }`)

  const promise = getToken('test')
  return expect(promise).resolves.toEqual({
    accessToken: 'test_token',
    type: 'Bearer',
    expires: 3600
  })
})
