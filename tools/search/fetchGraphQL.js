/* eslint-disable no-underscore-dangle */
/* eslint-disable default-param-last */
/**
 * This class provides methods to call GraphQL APIs
 */
export default class FetchGraphQL {
  /**
     * Returns a Promise that resolves with a POST request JSON data.
     *
     * @param {string} endpoint GraphQL endpoint
     * @param {string} headers - Headers object to use in the request
     * @param {string} query - the query string
     * @param {object} [variables] The query variables
     * @param {object} [options={}] - additional POST request options
     * @returns {Promise<any>} - the response body wrapped inside a Promise
     */
  static postQuery(endpoint, headers = {}, query, variables = null, options = {}) {
    return FetchGraphQL.__handleRequest(endpoint, headers, query, variables, options);
  }

  /**
     * Returns a Promise that resolves with a GET request JSON data.
     *
     * @param {string} endpoint - Path for persisted query
     * @param {string} headers - Headers object to use in the request
     * @param {object} [variables] The query variables
     * @param {object} [options={}] - additional GET request options
     * @returns {Promise<any>} - the response body wrapped inside a Promise
     */
  static getQuery(endpoint, headers = {}, variables = null, options = {}) {
    return FetchGraphQL.__handleRequest(endpoint, headers, variables, { method: 'GET', ...options });
  }

  /**
     * Returns an object for Request options
     *
     * @private
     * @param {string} requestHeaders - Headers object to use in the request
     * @param {string} [query] - The query string
     * @param {object} [variables] The query variables
     * @param {object} [options] Additional Request options
     * @param {string} [operationName] operationName
     * @returns {object} the Request options object
     */
  static __getRequestOptions(
    requestHeaders = {},
    query,
    variables = null,
    options = {},
    operationName,
  ) {
    const { method = 'POST' } = options;

    const body = {
      operationName,
      ...(query && { query }),
      ...(variables && { variables }),
    };

    const requestOptions = {
      headers: requestHeaders,
    };

    return {
      method,
      ...(method === 'POST' && { body: JSON.stringify(body) }),
      ...requestOptions,
      ...options,
    };
  }

  /**
     * Returns a Promise that resolves with a request JSON data.
     *
     * @private
     * @param {string} url - Request endpoint
     * @param {string} headers - Headers object to use in the request
     * @param {string} [query=''] - The query string
     * @param {object} [variables={}] - The query variables
     * @param {object} [options={}] - Request options
     * @returns {Promise<any>} the response body wrapped inside a Promise
     */
  static async __handleRequest(url, headers, query = '', variables = {}, options = {}) {
    const requestOptions = FetchGraphQL.__getRequestOptions(headers, query, variables, options);
    let response;
    // 1. Handle Request
    try {
      response = await fetch(url, requestOptions);
    } catch (error) {
      // 1.1 Request error: general
      throw new Error(error);
    }

    let apiError;
    // 2. Handle Response error
    if (!response.ok) {
      try {
        // 2.1 Check if custom error is returned
        apiError = await response.json();
      } catch (error) {
        // 2.3 Response error: Couldn't parse JSON - no error defined in API response
        throw new Error(error);
      }
    }

    if (apiError) {
      const apiErrors = apiError.errors || [apiError];
      const error = apiErrors[0] || {};
      const { extensions = {} } = error;
      // 2.2 Response error: JSON parsed - valid error defined in API response
      throw new Error(`${extensions.code}:  ${error.message}`);
    }
    // 3. Handle ok response
    let data;
    try {
      data = await response.json();
    } catch (error) {
      // 3.2. Response ok: Data error - Couldn't parse the JSON from OK response
      throw new Error(error);
    }

    return data;
  }

  /**
     * Check valid url
     *
     * @private
     * @param {string} url
     * @returns void
     */
  static __validateUrl(url) {
    const absUrl = url[0] === '/' ? `https://domain${url}` : url;

    try {
      new URL(absUrl); //eslint-disable-line
    } catch (e) {
      throw new Error(`InvalidParameter: Invalid URL: ${url}`);
    }
  }
}
