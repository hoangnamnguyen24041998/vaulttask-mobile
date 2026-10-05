import CryptoKit
import ExpoModulesCore
import LocalAuthentication
import Security

public final class NativeSecureVaultModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeSecureVault")

    AsyncFunction("authenticate") { (reason: String, promise: Promise) in
      let context = LAContext()
      var error: NSError?
      guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
        promise.reject("BIOMETRICS_UNAVAILABLE", error?.localizedDescription ?? "Device authentication is unavailable.")
        return
      }
      context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, authError in
        if let authError {
          promise.reject("AUTHENTICATION_FAILED", authError.localizedDescription)
        } else {
          promise.resolve(success)
        }
      }
    }

    AsyncFunction("encrypt") { (alias: String, plaintext: String) throws -> String in
      let sealed = try AES.GCM.seal(Data(plaintext.utf8), using: key(for: alias))
      guard let combined = sealed.combined else {
        throw SecureVaultError.encryptionFailed
      }
      return combined.base64EncodedString()
    }

    AsyncFunction("decrypt") { (alias: String, ciphertext: String) throws -> String in
      guard let data = Data(base64Encoded: ciphertext) else {
        throw SecureVaultError.invalidPayload
      }
      let box = try AES.GCM.SealedBox(combined: data)
      let clear = try AES.GCM.open(box, using: key(for: alias))
      guard let plaintext = String(data: clear, encoding: .utf8) else {
        throw SecureVaultError.invalidPayload
      }
      return plaintext
    }
  }

  private func key(for alias: String) throws -> SymmetricKey {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: "com.vaulttask.secure-vault",
      kSecAttrAccount as String: alias,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne
    ]
    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecSuccess, let data = result as? Data {
      return SymmetricKey(data: data)
    }
    guard status == errSecItemNotFound else {
      throw SecureVaultError.keyStoreFailure(status)
    }
    var bytes = Data(count: 32)
    let randomStatus = bytes.withUnsafeMutableBytes { buffer in
      SecRandomCopyBytes(kSecRandomDefault, 32, buffer.baseAddress!)
    }
    guard randomStatus == errSecSuccess else {
      throw SecureVaultError.keyStoreFailure(randomStatus)
    }
    let addQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: "com.vaulttask.secure-vault",
      kSecAttrAccount as String: alias,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      kSecValueData as String: bytes
    ]
    let addStatus = SecItemAdd(addQuery as CFDictionary, nil)
    if addStatus == errSecDuplicateItem {
      return try key(for: alias)
    }
    guard addStatus == errSecSuccess else {
      throw SecureVaultError.keyStoreFailure(addStatus)
    }
    return SymmetricKey(data: bytes)
  }
}

private enum SecureVaultError: LocalizedError {
  case encryptionFailed
  case invalidPayload
  case keyStoreFailure(OSStatus)

  var errorDescription: String? {
    switch self {
    case .encryptionFailed: return "Could not encrypt the secure value."
    case .invalidPayload: return "The encrypted value is invalid."
    case .keyStoreFailure(let status): return "Secure key storage failed (\(status))."
    }
  }
}
