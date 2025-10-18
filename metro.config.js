// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro can resolve worklets plugin during Babel transform
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = Object.assign({}, config.resolver.extraNodeModules || {}, {
	'react-native-worklets': path.resolve(__dirname, 'node_modules/react-native-worklets'),
});

module.exports = config;
