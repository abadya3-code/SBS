# SBTS — Smart Blind Tag System

نظام متكامل لإدارة أعمال **Blinding / De-blinding** في الخزانات والأوعية والمعدات، مع Workflow هندسي، PTW/LOTO، Gas Test، Torque، Inspection، Defect/Punch/NDT، الموافقات والشهادات.

## النسخة

`2.0.0-beta.4-railway-ready`

> هذه نسخة Staging / Pilot. لا تعتمد للاستخدام التشغيلي النهائي في المعمل قبل إكمال UAT واعتماد إجراءات الموقع.

## التقنية

- React + TypeScript + Vite
- Express + tRPC
- Drizzle ORM
- MySQL / TiDB
- S3-compatible object storage
- Railway-ready configuration

## تشغيل سريع محليًا

### المتطلبات

- Node.js 22
- Git
- Docker Desktop
- Corepack / pnpm

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env

docker compose -f docker-compose.local.yml up -d
pnpm db:migrate
pnpm admin:create
pnpm dev
```

افتح: `http://localhost:3000`

## رفع GitHub

المستودع المعد لهذه النسخة:

```text
https://github.com/abadya3-code/SBS.git
```

في Windows شغّل:

```text
01_UPLOAD_TO_GITHUB.cmd
```

أو استخدم الأوامر الموجودة في:

- `DEPLOY_GITHUB_RAILWAY_AR.md`

## Railway

الملف `railway.json` يحدد تلقائيًا:

- Build command
- Database migrations قبل التشغيل
- إنشاء أول Admin اختياريًا
- Start command
- Health check على `/health`

لأول تجربة تحتاج على Railway:

1. خدمة التطبيق من مستودع GitHub.
2. خدمة MySQL.
3. `DATABASE_URL` كـReference إلى `MYSQL_URL`.
4. `JWT_SECRET` قوي.
5. بيانات أول Admin.
6. `BOOTSTRAP_ADMIN_ON_DEPLOY=true` لأول نشر فقط.
7. يمكن البدء بـ`STORAGE_REQUIRED=false` ثم إضافة Railway Bucket لاحقًا.

التفاصيل الكاملة في [DEPLOY_GITHUB_RAILWAY_AR.md](DEPLOY_GITHUB_RAILWAY_AR.md).

## فحوصات المشروع

```bash
pnpm release:check
pnpm check
pnpm test
pnpm build
```

## Health endpoints

```text
GET /health
GET /ready
```

- `/health`: التطبيق يعمل.
- `/ready`: التطبيق متصل بقاعدة البيانات.

## المجلدات الرئيسية

```text
client/      واجهة React
server/      Express وtRPC ومنطق الخادم
shared/      الأنواع ومواصفات Workflow المشتركة
drizzle/     Schema وMigrations
scripts/     Migration/verification/admin scripts
docs/        التقارير الهندسية وخطط الاختبار
```

## الأمان

- لا ترفع ملف `.env` إلى GitHub.
- لا تضع كلمات المرور أو مفاتيح Railway داخل الكود.
- بعد إنشاء أول Admin احذف `ADMIN_PASSWORD` من Railway Variables وعطّل `BOOTSTRAP_ADMIN_ON_DEPLOY`.
- يفضل جعل مستودع GitHub **Private** خلال مرحلة التطوير والـPilot.
