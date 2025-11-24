const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  keep_classnames: false,
  keep_fnames: false,
  module: true,
  mangle: {
    toplevel: true,
  },
};
config.transformer.inlineRequires = true;

module.exports = config;
