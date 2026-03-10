const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  
  // Add web support
  config.resolver.platforms = ['ios', 'android', 'web'];
  
  // Ensure web assets are handled correctly
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
  config.resolver.sourceExts.push('svg');
  
  return config;
})();