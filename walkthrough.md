# Walkthrough: Nâng cấp React Native 0.75.5 → 0.86.2

## ✅ Tất cả thay đổi đã hoàn thành

### package.json

| Package | Trước | Sau |
|---|---|---|
| `react-native` | `0.75.5` | **`0.86.2`** |
| `react` | `18.3.1` | **`19.2.3`** |
| `react-native-reanimated` | `3.16.1` | **`^4.5.0`** |
| `react-native-screens` | `3.34.0` | **`^4.5.0`** |
| `react-native-safe-area-context` | `^4.14.0` | **`^5.4.0`** |
| `@react-navigation/native` | `^6.1.18` | **`^7.1.6`** |
| `@react-navigation/bottom-tabs` | `^6.6.1` | **`^7.3.10`** |
| `@react-navigation/stack` | `^6.4.1` | **`^7.3.1`** |
| `@react-native/*` (preset, codegen...) | `0.75.5` | **`0.86.2`** |
| `typescript` | `5.0.4` | **`5.3.3`** |

---

### android/build.gradle

```diff
- buildToolsVersion = "34.0.0"
+ buildToolsVersion = "35.0.0"
- minSdkVersion = 23
+ minSdkVersion = 24
- compileSdkVersion = 34
+ compileSdkVersion = 35
- targetSdkVersion = 34
+ targetSdkVersion = 35
- kotlinVersion = "1.9.25"
+ kotlinVersion = "2.1.20"
```

### android/gradle/wrapper/gradle-wrapper.properties

```diff
- distributionUrl=...gradle-8.8-all.zip
+ distributionUrl=...gradle-8.10.2-all.zip
```

### android/gradle.properties

```diff
- newArchEnabled=false
+ newArchEnabled=true
```

### android/settings.gradle

```diff
- rootProject.name = 'TempNative'
+ rootProject.name = 'PulseMobile'
```

### android/app/src/main/java/com/pulsemobile/MainApplication.kt

```diff
- import com.facebook.soloader.SoLoader
+ import com.facebook.react.soloader.OpenSourceMergedSoMapping
+ import com.facebook.soloader.SoLoader

- SoLoader.init(this, false)
+ SoLoader.init(this, OpenSourceMergedSoMapping)
```

---

## npm install kết quả

```
✅ added 541 packages, audited 542 packages
✅ found 0 vulnerabilities
```

> [!WARNING]
> **react-native-vector-icons** có deprecation warning: package đã chuyển sang mô hình per-icon-family.
> Hiện tại vẫn hoạt động bình thường, nhưng về lâu dài nên migrate sang `@react-native-vector-icons/` scoped packages.

---

## Bước Tiếp Theo

Để build và chạy app trên Android:

```bash
# Clean android build cache
cd android && ./gradlew clean && cd ..

# Chạy Metro bundler
npx react-native start --reset-cache

# Chạy trên Android (terminal khác)
npx react-native run-android
```

> [!IMPORTANT]
> Vì đã bật **New Architecture**, nếu gặp lỗi với thư viện nào đó hãy kiểm tra xem thư viện đó đã support New Arch chưa trên [React Native Directory](https://reactnative.directory/).
