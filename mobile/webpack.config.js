const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add fallback for native modules that don't exist on web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'crypto': require.resolve('crypto-browserify'),
    'stream': require.resolve('stream-browserify'),
    'buffer': require.resolve('buffer'),
    'util': require.resolve('util'),
    'process': require.resolve('process/browser'),
    'path': require.resolve('path-browserify'),
    'fs': false,
    'net': false,
    'tls': false,
  };
  
  return config;
};