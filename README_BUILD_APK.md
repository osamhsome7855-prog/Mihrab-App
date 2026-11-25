# بناء ملف APK لتطبيق «مِحراب» (Android Studio)

تم إنشاء مشروع أندرويد أصلي متكامل باستخدام **Kotlin** و**Jetpack Compose** داخل المجلد `android/`.

## خطوات استخراج ملف APK وتثبيته على الهاتف

1. افتح برنامج **Android Studio** (إصدار Koala أو أحدث).
2. اختر **Open** ثم حدّد المجلد `android/` داخل المشروع.
3. انتظر حتى ينتهي **Gradle Sync** تلقائياً من تنزيل حزم AndroidX وCompose.
4. لبناء ملف APK جاهز للتثبيت والاختبار:
   - من القائمة العلوية اختر:
     **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - أو من الطرفية (Terminal) داخل مجلد `android/`:
     - على macOS / Linux: `./gradlew assembleDebug`
     - على Windows: `gradlew.bat assembleDebug`
5. بعد انتهاء البناء ستجد ملف الـ APK في المسار:
   `android/app/build/outputs/apk/debug/app-debug.apk`
6. انقل الملف إلى هاتفك الأندرويد وافتحه لتثبيته مباشرة (أو شغّل التطبيق عبر كابل USB من Android Studio بالضغط على زر **Run**).

## لإصدار نسخة متجر أو APK موقّع (Release APK)

1. اختر **Build > Generate Signed Bundle / APK...**
2. اختر **APK** ثم أنشئ أو اختر ملف Keystore الخاص بك.
3. اختر نوع البناء **release** وسيتم إنشاء `app-release.apk`.
