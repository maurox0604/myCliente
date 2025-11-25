const { en } = require("react-native-paper-dates");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin','expo-env'],
  };
};


// module.exports = api => {
//   // Get the platform from the API caller...
//   const platform = api.caller(caller => caller && caller.platform);

//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
      
//       // Add a web-only plugin...
//       platform === 'web' && 'custom-web-only-plugin',
//       'react-native-reanimated/plugin',
//     ].filter(Boolean),
//   };
// };
