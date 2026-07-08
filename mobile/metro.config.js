const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Escape backslashes for Windows path regex matching
const parentNodeModules = path.resolve(__dirname, '../node_modules').replace(/\\/g, '\\\\');
const parentModelCustom = path.resolve(__dirname, '../model_custom').replace(/\\/g, '\\\\');
const parentModel = path.resolve(__dirname, '../model').replace(/\\/g, '\\\\');

config.resolver.blockList = [
  new RegExp(parentNodeModules),
  new RegExp(parentModelCustom),
  new RegExp(parentModel),
];

module.exports = config;
