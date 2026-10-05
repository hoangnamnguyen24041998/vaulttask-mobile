package expo.modules.securevault

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class NativeSecureVaultModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeSecureVault")

    AsyncFunction("authenticate") { reason: String, promise: Promise ->
      val activity = appContext.currentActivity as? FragmentActivity
      if (activity == null) {
        promise.reject("NO_ACTIVITY", "Biometric authentication requires an active app screen.", null)
        return@AsyncFunction
      }
      val canAuthenticate = BiometricManager.from(activity)
        .canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
      if (canAuthenticate != BiometricManager.BIOMETRIC_SUCCESS) {
        promise.reject("BIOMETRICS_UNAVAILABLE", "No enrolled biometric or device credential is available.", null)
        return@AsyncFunction
      }
      val executor = ContextCompat.getMainExecutor(activity)
      val prompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          promise.resolve(true)
        }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          if (errorCode == BiometricPrompt.ERROR_USER_CANCELED || errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON) {
            promise.resolve(false)
          } else {
            promise.reject("AUTHENTICATION_FAILED", errString.toString(), null)
          }
        }
      })
      val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle("VaultTask")
        .setSubtitle(reason)
        .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK)
        .build()
      prompt.authenticate(promptInfo)
    }

    AsyncFunction("encrypt") { alias: String, plaintext: String ->
      val cipher = Cipher.getInstance("AES/GCM/NoPadding")
      cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey(alias))
      val encrypted = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
      Base64.encodeToString(cipher.iv + encrypted, Base64.NO_WRAP)
    }

    AsyncFunction("decrypt") { alias: String, ciphertext: String ->
      val bytes = Base64.decode(ciphertext, Base64.NO_WRAP)
      require(bytes.size > 12) { "Encrypted payload is invalid." }
      val iv = bytes.copyOfRange(0, 12)
      val encrypted = bytes.copyOfRange(12, bytes.size)
      val cipher = Cipher.getInstance("AES/GCM/NoPadding")
      cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(alias), GCMParameterSpec(128, iv))
      String(cipher.doFinal(encrypted), Charsets.UTF_8)
    }
  }

  private fun getOrCreateKey(alias: String): SecretKey {
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }
    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    generator.init(
      KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setRandomizedEncryptionRequired(true)
        .build()
    )
    return generator.generateKey()
  }
}
