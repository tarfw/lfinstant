const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add storage resolver for InstantDB to use expo-sqlite
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect Storage.native to @instant/Storage.expo.native
  if (moduleName.endsWith('Storage.native')) {
    const sqlitePath = moduleName.replace('Storage.native', '@instant/Storage.expo.native');
    return context.resolveRequest(context, sqlitePath, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
