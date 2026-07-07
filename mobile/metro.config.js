const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude parent project node_modules and other folders to stop Metro from recursively scanning them on Windows
config.resolver.blockList = [
  new RegExp(path.resolve(__dirname, '../node_modules')),
  new RegExp(path.resolve(__dirname, '../model_custom')),
  new RegExp(path.resolve(__dirname, '../model')),
  new RegExp(path.resolve(__dirname, '../mobile/node_modules/.*\/node_modules')),
];

module.exports = config;
