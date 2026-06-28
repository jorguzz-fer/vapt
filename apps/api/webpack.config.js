module.exports = function (options) {
  return {
    ...options,
    externals: [
      function ({ request }, callback) {
        if (!request) return callback();
        // Bundle @vapt/* workspace packages into the output
        if (request.startsWith('@vapt/')) return callback();
        // Bundle relative and absolute imports
        if (request.startsWith('.') || request.startsWith('/')) return callback();
        // Externalize real node_modules
        return callback(null, 'commonjs ' + request);
      },
    ],
  };
};
