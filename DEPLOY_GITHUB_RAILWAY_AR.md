# دليل رفع SBTS إلى GitHub وتشغيله على Railway

هذا الدليل مخصص للنسخة:

```text
SBTS v2.0.0-beta.4-railway-ready
```

والمستودع الظاهر في الصور:

```text
https://github.com/abadya3-code/SBS.git
```

---

# أولًا: سبب خطأ Railway الظاهر في الصورة

مستودع `SBS` في GitHub ما زال فارغًا، لذلك Railway لا يجد ملفات مشروع ليقرأها. رسالة:

```text
Failed to fetch repository files
```

غالبًا سببها أحد الأمرين:

1. المستودع فارغ ولم يتم رفع المشروع بعد.
2. Railway GitHub App لا يملك صلاحية الوصول إلى المستودع.

ابدأ برفع الملفات إلى GitHub، ثم اعمل Refresh داخل Railway. إذا بقي الخطأ، افتح **Configure GitHub App** وامنح Railway صلاحية الوصول إلى `abadya3-code/SBS`.

---

# ثانيًا: رفع المشروع إلى GitHub — الطريقة الموصى بها على Windows

## 1. فك ضغط الملف

فك ضغط:

```text
SBTS_GitHub_Railway_Ready.zip
```

يجب أن ترى في جذر المجلد مباشرة:

```text
client/
server/
shared/
drizzle/
scripts/
package.json
pnpm-lock.yaml
railway.json
README.md
```

لا ترفع مجلدًا يحتوي داخله مجلدًا ثانيًا للمشروع. يجب أن يكون `package.json` في جذر المستودع.

## 2. تأكد من تثبيت Git

افتح PowerShell داخل مجلد المشروع واكتب:

```powershell
git --version
```

إذا ظهر رقم الإصدار فكل شيء جاهز.

## 3. شغّل ملف الرفع الجاهز

انقر مرتين على:

```text
01_UPLOAD_TO_GITHUB.cmd
```

سيقوم بالآتي:

- تهيئة Git.
- إنشاء branch باسم `main`.
- إضافة الملفات.
- إنشاء أول Commit.
- ربط المستودع `abadya3-code/SBS`.
- رفع المشروع إلى GitHub.

قد يفتح Git نافذة تسجيل دخول GitHub في المتصفح. وافق على الدخول.

## أو استخدم الأوامر يدويًا

داخل مجلد المشروع:

```powershell
git init -b main
git add .
git commit -m "SBTS v2.0.0-beta.4 Railway-ready"
git remote add origin https://github.com/abadya3-code/SBS.git
git push -u origin main
```

إذا كان `origin` موجودًا مسبقًا:

```powershell
git remote set-url origin https://github.com/abadya3-code/SBS.git
git push -u origin main
```

## بعد الرفع

افتح المستودع في GitHub وتأكد أن الملفات التالية ظاهرة في الصفحة الأولى:

- `package.json`
- `pnpm-lock.yaml`
- `railway.json`
- `client`
- `server`
- `drizzle`
- `README.md`

---

# ثالثًا: ربط GitHub مع Railway

## 1. تحديث صلاحية GitHub App

داخل نافذة Railway التي ظهرت في الصورة:

1. اضغط **Configure GitHub App**.
2. اختر حساب `abadya3-code`.
3. اختر أحد الخيارين:
   - All repositories، أو
   - Only select repositories ثم اختر `SBS`.
4. احفظ.
5. ارجع إلى Railway واضغط **Refresh**.
6. اختر `abadya3-code/SBS`.

Railway سيقرأ `railway.json` تلقائيًا من جذر المستودع.

---

# رابعًا: إنشاء مشروع Railway الصحيح

الأفضل إنشاء مشروع Railway يحتوي على:

```text
SBTS App
MySQL
Railway Bucket (اختياري في أول تجربة، مطلوب للمرفقات)
```

## 1. أضف MySQL

داخل Railway Project:

1. اضغط `+ New` أو `Create`.
2. اختر `Database`.
3. اختر `MySQL`.
4. انتظر حتى تصبح الخدمة جاهزة.

## 2. اربط قاعدة البيانات بالتطبيق

افتح خدمة تطبيق SBTS ثم:

1. `Variables`.
2. `New Variable` أو `Add Reference`.
3. أنشئ:

```text
DATABASE_URL = ${{MySQL.MYSQL_URL}}
```

استخدم زر Add Reference بدل كتابة كلمة المرور يدويًا. قد يكون اسم خدمة قاعدة البيانات مختلفًا؛ اختر متغير `MYSQL_URL` من الخدمة التي أنشأتها.

---

# خامسًا: Variables المطلوبة لأول نشر

أضف داخل خدمة SBTS:

```text
NODE_ENV=production
HOST=0.0.0.0
JWT_SECRET=<قيمة عشوائية قوية 64 حرفًا أو أكثر>
REQUEST_BODY_LIMIT=50mb
STORAGE_REQUIRED=false
ENABLE_MANUS_RUNTIME=false
```

## توليد JWT_SECRET في PowerShell

```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 80 | ForEach-Object {[char]$_})
```

انسخ الناتج وضعه في `JWT_SECRET`.

---

# سادسًا: إنشاء أول Admin تلقائيًا

لأول نشر فقط أضف:

```text
BOOTSTRAP_ADMIN_ON_DEPLOY=true
ADMIN_NAME=SBTS Administrator
ADMIN_EMAIL=ضع-بريدك-هنا
ADMIN_PASSWORD=ضع-كلمة-مرور-قوية-هنا
ADMIN_EMPLOYEE_NUMBER=SBTS-ADMIN
```

مثال كلمة مرور قوية:

```text
SBTS@Pilot-2026-ChangeMe!
```

عند النشر، Railway سينفذ بالترتيب:

```text
Database migrations
→ Seed roles and workflows
→ Create first Admin
→ Start application
```

## بعد نجاح تسجيل الدخول

ارجع إلى Variables ونفذ:

```text
BOOTSTRAP_ADMIN_ON_DEPLOY=false
```

ثم احذف:

```text
ADMIN_PASSWORD
```

ويفضل حذف بقية متغيرات Admin بعد نجاح إنشاء الحساب.

---

# سابعًا: أول Deploy

بعد إضافة Variables:

1. افتح خدمة SBTS.
2. اضغط `Deploy` أو `Redeploy`.
3. تابع Build Logs.

الأوامر التي سيشغلها `railway.json`:

## Build

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
pnpm release:check
pnpm build
```

## Pre-deploy

```bash
pnpm db:migrate
pnpm admin:create   # فقط عندما BOOTSTRAP_ADMIN_ON_DEPLOY=true
```

## Start

```bash
NODE_ENV=production pnpm start
```

## Health check

```text
/health
```

---

# ثامنًا: إنشاء Public Domain

بعد نجاح النشر:

1. افتح خدمة SBTS.
2. انتقل إلى `Settings` أو `Networking`.
3. اضغط `Generate Domain`.
4. افتح الرابط.

اختبر:

```text
https://YOUR-DOMAIN/health
https://YOUR-DOMAIN/ready
```

النتيجة المطلوبة:

```json
{"status":"ok"}
```

و:

```json
{"status":"ready","database":"connected"}
```

ثم افتح الصفحة الرئيسية وسجل الدخول بحساب Admin.

---

# تاسعًا: إضافة Railway Bucket للمرفقات

يمكن تجربة النظام أولًا مع:

```text
STORAGE_REQUIRED=false
```

لكن رفع الصور والوثائق يحتاج Bucket.

## الخطوات

1. أضف `Storage Bucket` إلى Railway Project.
2. في Variables الخاصة بتطبيق SBTS أضف References إلى متغيرات الـBucket:

```text
BUCKET
ENDPOINT
ACCESS_KEY_ID
SECRET_ACCESS_KEY
REGION
```

3. أضف:

```text
S3_FORCE_PATH_STYLE=true
STORAGE_REQUIRED=true
```

4. اعمل Redeploy.

التطبيق يقرأ Railway Bucket variables مباشرة، ويمكن أيضًا استخدام أسماء `S3_*` الموجودة في `.env.example`.

---

# عاشرًا: التشغيل محليًا

## المتطلبات

- Node.js 22.16 أو أحدث ضمن Node 22.
- Docker Desktop.
- Git.

## الخطوات على PowerShell

```powershell
cd C:\Path\To\SBTS_GitHub_Railway_Ready
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
Copy-Item .env.example .env
```

شغّل MySQL وMinIO:

```powershell
docker compose -f docker-compose.local.yml up -d
```

طبق قاعدة البيانات:

```powershell
pnpm db:migrate
```

عدل `.env` وضع Admin حقيقيًا، ثم:

```powershell
pnpm admin:create
pnpm dev
```

افتح:

```text
http://localhost:3000
```

## اختبار نسخة Production محليًا

```powershell
pnpm release:check
pnpm check
pnpm test
pnpm build
$env:NODE_ENV="production"
pnpm start
```

---

# حل المشاكل الشائعة

## Railway لا يرى Repository

- تأكد أن GitHub repo غير فارغ.
- تأكد أن `package.json` في الجذر.
- Configure GitHub App ثم اسمح لـ`SBS`.
- اضغط Refresh.
- إذا بقي الخطأ، افصل GitHub App وأعد ربطها.

## Build يفشل عند pnpm

تأكد أن الملفات التالية موجودة في GitHub:

```text
package.json
pnpm-lock.yaml
patches/wouter@3.7.1.patch
```

ولا تعدل `pnpm-lock.yaml` يدويًا.

## Pre-deploy يفشل في Database

- افحص `DATABASE_URL`.
- استخدم Reference إلى `MYSQL_URL`.
- تأكد أن MySQL service تعمل.
- لا تستخدم قاعدة Production قبل نجاح Staging.

## التطبيق يعمل لكن /ready يرجع 503

التطبيق يعمل، لكن اتصال قاعدة البيانات غير صحيح. راجع `DATABASE_URL` وLogs.

## التطبيق يفشل Startup بسبب Storage

لأول تجربة استخدم:

```text
STORAGE_REQUIRED=false
```

ثم أضف Bucket لاحقًا.

## لا أستطيع تسجيل الدخول

- تأكد أن `BOOTSTRAP_ADMIN_ON_DEPLOY=true` كان موجودًا في أول Deploy.
- افحص Pre-deploy Logs وابحث عن:

```text
Admin account created
```

- بعد النجاح عطّل Bootstrap واحذف كلمة المرور من Variables.

---

# قائمة قبول أول تجربة

- [ ] الملفات ظاهرة في GitHub.
- [ ] Railway GitHub App لها صلاحية `SBS`.
- [ ] MySQL service جاهزة.
- [ ] `DATABASE_URL` Reference مضافة.
- [ ] `JWT_SECRET` مضاف.
- [ ] Admin bootstrap variables مضافة.
- [ ] Build ناجح.
- [ ] Migrations ناجحة.
- [ ] `/health` ناجح.
- [ ] `/ready` ناجح.
- [ ] Login ناجح.
- [ ] إنشاء Project تجريبي ناجح.
- [ ] إنشاء Blind تجريبية ناجح.
- [ ] بعد النجاح تم حذف `ADMIN_PASSWORD` وتعطيل Bootstrap.

---

# قواعد البيانات القديمة وDomain Migration Baseline

هذا الخيار يستخدم فقط إذا كانت قاعدة البيانات القديمة طُبقت عليها Migrations رقم 0013 أو 0014 أو 0015 أو 0016 يدويًا في السابق، وتأكدت من وجود جداولها بالفعل.

يمكن عندها استخدام متغير مؤقت مثل:

```text
SBTS_DOMAIN_MIGRATION_BASELINE_UP_TO=16
```

ثم تشغيل `pnpm db:migrate`. بعد نجاح تسجيل الـBaseline احذف المتغير فورًا.

**لا تستخدم هذا المتغير على قاعدة بيانات جديدة، ولا تستخدمه لتجاوز Migration فاشلة.** على Railway Staging الجديدة اتركه غير موجود.
