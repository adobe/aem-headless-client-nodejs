<!--
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->
# AEM HEADLESS SDK API Reference

## Classes

<dl>
<dt><a href="#AEMHeadless">AEMHeadless</a></dt>
<dd><p>This class provides methods to call AEM GraphQL APIs.
Before calling any method initialize the instance
with GraphQL endpoint, GraphQL serviceURL and auth if needed</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getToken">getToken(credentialsFilePath)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Returns a Promise that resolves with a credentials JSON data.</p>
</dd>
</dl>

<a name="AEMHeadless"></a>

## AEMHeadless
This class provides methods to call AEM GraphQL APIs.
Before calling any method initialize the instance
with GraphQL endpoint, GraphQL serviceURL and auth if needed

**Kind**: global class  
<a name="new_AEMHeadless_new"></a>

### new AEMHeadless(config)
Constructor.

If param is a string, it's treated as AEM server URL, default GraphQL endpoint is used.
For granular params, use config object

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>config</td><td><code>string</code> | <code>object</code></td><td><p>Configuration object, or AEM server URL string</p>
</td>
    </tr><tr>
    <td>[config.serviceURL]</td><td><code>string</code></td><td><p>AEM server URL</p>
</td>
    </tr><tr>
    <td>[config.endpoint]</td><td><code>string</code></td><td><p>GraphQL endpoint</p>
</td>
    </tr><tr>
    <td>[config.auth]</td><td><code>string</code> | <code>Array</code></td><td><p>Bearer token string or [user,pass] pair array</p>
</td>
    </tr><tr>
    <td>[config.fetch]</td><td><code>object</code></td><td><p>custom Fetch instance - default @adobe/aio-lib-core-networking</p>
</td>
    </tr>  </tbody>
</table>

<a name="getToken"></a>

## getToken(credentialsFilePath) ⇒ <code>Promise.&lt;any&gt;</code>
Returns a Promise that resolves with a credentials JSON data.

**Kind**: global function  
**Returns**: <code>Promise.&lt;any&gt;</code> - the response body wrapped inside a Promise  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>credentialsFilePath</td><td><code>string</code></td><td><p>credentials config file path (serviceToken or devToken content)</p>
</td>
    </tr>  </tbody>
</table>

For detailed methods usage, check https://github.com/adobe/aem-headless-client-js
