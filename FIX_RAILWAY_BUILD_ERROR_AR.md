# إصلاح خطأ Railway: `node_modules must not be included in the release`

## سبب الخطأ

كان أمر Railway ينفذ `pnpm install` أولًا، ثم يشغّل `pnpm release:check`.
بعد التثبيت ينشئ pnpm مجلد `node_modules` بصورة طبيعية، ولذلك اعتبر الفحص القديم عملية التثبيت نفسها خطأً.

هذا لا يعني أن `node_modules` مرفوع إلى GitHub. الخطأ كان في ترتيب وفكرة فحص الإصدار.

## ما تم إصلاحه

1. تشغيل `release:check` قبل `pnpm install`.
2. فحص ملفات `node_modules` المتتبعة بواسطة Git بدل رفض مجلد التثبيت الطبيعي.
3. السماح بتشغيل build scripts اللازمة لـ `esbuild` و`@tailwindcss/oxide` في pnpm 10.
4. تشغيل السيرفر مباشرة بواسطة `node dist/index.js`.
5. تحسين `.railwayignore` و`.dockerignore` للمجلدات المتداخلة.

## رفع الإصلاح إلى مستودعك الحالي

فك ضغط حزمة الإصلاح داخل جذر مشروع SBTS، ووافق على استبدال الملفات، ثم نفذ:

```powershell
git add package.json railway.json pnpm-workspace.yaml scripts/verify-release.mjs .railwayignore .dockerignore FIX_RAILWAY_BUILD_ERROR_AR.md
git commit -m "Fix Railway release check and pnpm build scripts"
git push origin main
```

Railway سيبدأ Deployment جديدًا تلقائيًا بعد وصول الـCommit.

## النتيجة المتوقعة في Build Logs

```text
release:check
status: passed
pnpm install --frozen-lockfile
pnpm build
```

إذا وصل Build إلى خطأ جديد بعد هذه النقطة، انسخ أول رسالة خطأ حمراء من السجل؛ ستكون مشكلة مختلفة عن `node_modules`.
