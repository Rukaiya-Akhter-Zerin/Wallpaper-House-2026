# Code Signing Guide

## macOS

### Prerequisites
- Apple Developer account ($99/year)
- Developer ID Application certificate

### Generate Certificate
1. Go to https://developer.apple.com/account/resources/certificates
2. Create "Developer ID Application" certificate
3. Download and install in Keychain
4. Export as .p12

### CI Setup
Encode the .p12 as base64:
```bash
openssl base64 -A -in certificate.p12 | pbcopy
```

Set GitHub Secrets:
| Secret | Value |
|--------|-------|
| `APPLE_CERTIFICATE` | Base64-encoded .p12 |
| `APPLE_CERTIFICATE_PASSWORD` | .p12 export password |
| `APPLE_SIGNING_IDENTITY` | "Developer ID Application: Your Name (TEAM_ID)" |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_PASSWORD` | App-specific password from appleid.apple.com |
| `APPLE_TEAM_ID` | 10-character team ID |

### Notarization
Tauri handles notarization automatically via `xcrun notarytool`. No manual setup needed beyond the env vars above.

---

## Windows

### Prerequisites
- Code signing certificate (.pfx) from a CA (Sectigo, DigiCert, etc.)

### CI Setup
Encode the .pfx as base64:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.pfx")) | Set-Clipboard
```

Set GitHub Secrets:
| Secret | Value |
|--------|-------|
| `WINDOWS_CERTIFICATE` | Base64-encoded .pfx |
| `WINDOWS_CERTIFICATE_PASSWORD` | .pfx export password |

---

## Updater Signing

Generate a signing key pair:
```bash
tauri signer generate -w ~/.tauri/wallpaper-house.key
```

Set GitHub Secrets:
| Secret | Value |
|--------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | Content of the generated key file |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password used during generation |

The public key goes in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.

---

## Linux

No code signing required for Linux builds (AppImage, DEB, RPM). Optional GPG signing for repository distribution.
