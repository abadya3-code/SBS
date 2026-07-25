# إصلاح رفع SBTS إلى GitHub ثم Railway

## سبب الخطأ الحالي

- مستودع GitHub `abadya3-code/SBS` فارغ ولا يحتوي أي Commit أو فرع `main`.
- الأمر `git remote add origin` نُفذ من دون رابط، لذلك لم يُضف Remote.
- الأمر `git push` فشل لأنه لا يوجد Push Destination.
- ملف `.git/COMMIT_EDITMSG.swp` نتج من جلسة Commit سابقة توقفت داخل Vim.
- `git add .` يجهز الملفات فقط؛ لا ينشئ Commit ولا يرفعها.

## الطريقة الأسرع

1. أغلق أي نافذة Vim أو Git Commit مفتوحة.
2. فك ضغط النسخة الجديدة.
3. افتح المجلد الذي يحتوي `package.json` و`railway.json`.
4. شغّل `00_CLEAN_UPLOAD_GITHUB.cmd`.
5. اكتب `YES` عند طلب التأكيد.
6. أدخل اسمك وبريد GitHub إذا طلبهما.
7. أكمل تسجيل الدخول إلى GitHub من المتصفح.
8. افتح مستودع SBS وتأكد من ظهور الملفات ووجود Commit واحد على الأقل.
9. ارجع إلى Railway واضغط Refresh ثم Deploy Repo.

## الطريقة اليدوية في PowerShell

نفذ من جذر المشروع:

```powershell
Remove-Item -Recurse -Force .git
git init
git config --global user.name "Abdullah Alaqil"
git config --global user.email "YOUR_GITHUB_EMAIL"
git add .
git status --short
git commit -m "Initial SBTS v2.0.0-beta.4 Railway-ready release"
git branch -M main
git remote add origin https://github.com/abadya3-code/SBS.git
git remote -v
git push -u origin main
```

لا تنفذ `git remote add origin` وحده؛ يجب أن يتبعه رابط المستودع في نفس السطر.

## التحقق قبل Railway

```powershell
git branch --show-current
git log --oneline -1
git remote -v
git status
```

النتيجة المطلوبة:

- الفرع: `main`
- يوجد Commit واحد على الأقل
- Remote باسم `origin`
- Working tree clean

## Railway

1. Configure GitHub App واجعل Repository access يشمل `SBS`.
2. Refresh.
3. اختر `abadya3-code/SBS` ثم Deploy Repo.
4. أضف MySQL service.
5. أضف Reference Variable:

```text
DATABASE_URL=${{MySQL.MYSQL_URL}}
```

6. أضف Variables:

```text
NODE_ENV=production
HOST=0.0.0.0
JWT_SECRET=ضع_قيمة_عشوائية_بطول_64_حرف_أو_أكثر
REQUEST_BODY_LIMIT=50mb
STORAGE_REQUIRED=false
ENABLE_MANUS_RUNTIME=false
BOOTSTRAP_ADMIN_ON_DEPLOY=true
ADMIN_NAME=SBTS Administrator
ADMIN_EMAIL=بريدك
ADMIN_PASSWORD=كلمة_مرور_قوية
ADMIN_EMPLOYEE_NUMBER=SBTS-ADMIN
```

7. ابدأ Deploy وانتظر نجاح Build وPre-deploy migration وHealthcheck.
8. أنشئ Public Domain واختبر `/health` و`/ready`.
9. بعد أول تسجيل دخول، غيّر `BOOTSTRAP_ADMIN_ON_DEPLOY=false` واحذف `ADMIN_PASSWORD` من Railway Variables.
