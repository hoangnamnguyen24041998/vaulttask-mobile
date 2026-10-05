const { withAppBuildGradle } = require('expo/config-plugins');

const marker = '// vaulttask-product-flavors';

module.exports = function withAndroidProductFlavors(config) {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('VaultTask product flavors require the generated Android Groovy build.gradle.');
    }
    const source = config.modResults.contents;
    if (source.includes(marker)) return config;
    if (!/android\s*\{/.test(source)) {
      throw new Error('Could not find the Android application configuration block for product flavors.');
    }
    config.modResults.contents = source.replace(
      /android\s*\{/,
      `android {
  ${marker}
  flavorDimensions "brand"
  productFlavors {
    retail {
      dimension "brand"
      applicationIdSuffix ".retail"
      resValue "string", "app_name", "VaultTask Retail"
    }
    enterprise {
      dimension "brand"
      applicationIdSuffix ".enterprise"
      resValue "string", "app_name", "VaultTask Enterprise"
    }
  }`,
    );
    return config;
  });
};
