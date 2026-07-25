# إعداد Railway مرة واحدة

## 1. مصدر التطبيق

داخل خدمة SBS في Railway:

- Repository: `abadya3-code/SBS`
- Branch: `main`
- Root Directory: فارغ
- Auto Deploy: Enabled

كل Push جديد إلى `main` سيبدأ Deployment جديدًا.

## 2. قاعدة البيانات

أضف خدمة MySQL داخل نفس مشروع Railway، ثم أضف داخل Variables لخدمة SBS:

```env
DATABASE_URL=${{MySQL.MYSQL_URL}}
```

## 3. متغيرات التطبيق

```env
NODE_ENV=production
HOST=0.0.0.0
STORAGE_REQUIRED=false
ENABLE_MANUS_RUNTIME=false
REQUEST_BODY_LIMIT=50mb
JWT_SECRET=PUT_A_RANDOM_SECRET_OF_AT_LEAST_64_CHARACTERS_HERE
```

لأول نشر فقط:

```env
BOOTSTRAP_ADMIN_ON_DEPLOY=true
ADMIN_NAME=SBTS Administrator
ADMIN_EMAIL=YOUR_EMAIL
ADMIN_PASSWORD=YOUR_STRONG_PASSWORD
ADMIN_EMPLOYEE_NUMBER=SBTS-ADMIN
```

لا تضف `PORT`؛ Railway تزوده تلقائيًا.

## 4. أوامر النشر المضمنة

`railway.json` ينفذ:

- Build: `pnpm railway:build`
- Pre-deploy: `pnpm railway:predeploy`
- Start: `node dist/index.js`
- Health check: `/health`

## 5. بعد نجاح أول دخول

غيّر:

```env
BOOTSTRAP_ADMIN_ON_DEPLOY=false
```

ثم احذف `ADMIN_PASSWORD` من Railway Variables.

## 6. إنشاء الرابط

من Settings → Networking → Generate Domain، ثم اختبر:

- `/health`
- `/ready`
- الصفحة الرئيسية
