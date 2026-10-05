import { requireOptionalNativeModule } from 'expo-modules-core';

export interface NativeSecureVaultModule {
  authenticate(reason: string): Promise<boolean>;
  encrypt(alias: string, plaintext: string): Promise<string>;
  decrypt(alias: string, ciphertext: string): Promise<string>;
}

export const nativeSecureVault =
  requireOptionalNativeModule<NativeSecureVaultModule>('NativeSecureVault');
