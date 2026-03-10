module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: {
          'react-native$': 'react-native-web',
          'react-native-svg': 'react-native-svg-web',
        },
        extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx', '.json'],
      }],
    ],
  };
};