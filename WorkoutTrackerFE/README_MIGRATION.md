# HƯỚNG DẪN BUILD CHUYỂN DỰ ÁN SANG MÁY MỚI (REACT NATIVE CLI)

Dành cho dự án: **WorkoutTrackerFE** (Pulse Mobile - RN CLI)

---

## 🛠️ YÊU CẦU TRÊN MÁY MỚI
Trước khi thực hiện, đảm bảo máy tính mới đã cài đặt:
1. **Node.js** (Phiên bản >= 18)
2. **JDK** (Java Development Kit - khuyến nghị OpenJDK 17)
3. **Android Studio** (Đã cài Android SDK, Android SDK Platform-Tools và tạo sẵn 1 Máy ảo / cắm điện thoại Android bật USB Debugging)
4. Biến môi trường `ANDROID_HOME` đã được cấu hình trỏ tới thư mục Android SDK.

---

## 🚀 BƯỚC THỰC HIỆN CHI TIẾT

### Bước 1: Tạo thư mục Native tạm
Mở Terminal / PowerShell tại thư mục gốc chứa project (ví dụ `d:\GitHub\WorkoutTracker\`):

```bash
npx @react-native-community/cli init TempNative --version 0.75.5 --skip-install
```
*(Lưu ý: Đặt tên `TempNative` để tránh trùng tên với thư mục `WorkoutTrackerFE` đã có sẵn)*

---

### Bước 2: Copy thư mục `android/` sang dự án chính
Copy duy nhất thư mục `android/` vừa tạo sang `WorkoutTrackerFE`:

- **Windows (CMD / PowerShell):**
```cmd
xcopy /E /I TempNative\android WorkoutTrackerFE\android
```
- **Hoặc thực hiện thao tác thủ công:** Copy folder `android` từ trong `TempNative` dán vào trong folder `WorkoutTrackerFE`.

---

### Bước 3: Đổi tên Package Name cho chuẩn
Mở file `android/app/src/main/AndroidManifest.xml` và `android/app/build.gradle` (nếu cần), đảm bảo đổi tên package mặc định `com.tempnative` thành `com.pulsemobile` để đồng nhất với cấu hình trong `app.json`.

---

### Bước 4: Xóa thư mục tạm
Xóa thư mục `TempNative` để nhẹ máy:

```cmd
rmdir /S /Q TempNative
```

---

### Bước 5: Cài đặt Dependencies và Run App
Vào thư mục dự án `WorkoutTrackerFE`, tiến hành cài đặt thư viện và khởi chạy lên thiết bị Android:

```bash
cd WorkoutTrackerFE
npm install
npx react-native run-android
```

---

> **Ghi chú:** 
> - Lần đầu tiên chạy `npx react-native run-android`, Gradle sẽ mất khoảng 3 - 5 phút để tải các gói phụ thuộc Native cho Android.
> - Đảm bảo máy ảo Android đang bật hoặc thiết bị thật đã được kết nối trước khi chạy lệnh build.
