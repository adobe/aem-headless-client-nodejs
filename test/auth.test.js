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
jest.setMock('@adobe/aemcs-api-client-lib', async (data) => {
  return new Promise((resolve, reject) => {
    if (data && data.serviceToken) {
      resolve(data)
    } else {
      reject(Error('aemcs error'))
    }
  })
})

const { getToken } = require('../src')

// /////////////////////////////////////////////
beforeAll(() => {
  fs.writeFileSync.mockClear()
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
  fs.readFileSync.mockReturnValue(`{
    "serviceToken": false
  }`)
  const promise = getToken('test')
  return expect(promise).rejects.toThrow('aemcs error')
})

test('AUTH: should use service token', () => {
  fs.readFileSync.mockReturnValue(`{
    "serviceToken": true,
    "access_token": "test"
  }`)
  const promise = getToken('test')
  return expect(promise).resolves.toBeTruthy()
})
