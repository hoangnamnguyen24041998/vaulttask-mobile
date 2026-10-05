Pod::Spec.new do |s|
  s.name           = 'NativeSecureVault'
  s.version        = '1.0.0'
  s.summary        = 'Biometric authentication and device-bound encryption for VaultTask.'
  s.description    = 'Expo native module using LocalAuthentication and Keychain on Apple platforms.'
  s.license        = { :type => 'MIT' }
  s.author         = 'VaultTask'
  s.homepage       = 'https://example.invalid/native-secure-vault'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => 'https://example.invalid/native-secure-vault.git', :tag => s.version.to_s }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift}'
end
