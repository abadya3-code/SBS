# ابدأ من هنا

## أسرع طريقة

1. فك ضغط الملف كاملًا.
2. افتح المجلد الناتج.
3. انقر مرتين على `01_UPLOAD_TO_GITHUB.cmd`.
4. بعد ظهور الملفات في `abadya3-code/SBS` ارجع إلى Railway واضغط **Refresh**.
5. إذا استمر `Failed to fetch repository files` اضغط **Configure GitHub App** واسمح لـRailway بالوصول إلى مستودع `SBS`.
6. اتبع `DEPLOY_GITHUB_RAILWAY_AR.md` لإضافة MySQL وVariables وإنشاء أول Admin.

## ترتيب الملفات الصحيح في GitHub

يجب أن يكون `package.json` في الصفحة الرئيسية للمستودع، بجانب:

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

لا ترفع ملف ZIP نفسه فقط إلى GitHub؛ GitHub وRailway لن يفكا ضغطه تلقائيًا. ارفع الملفات المستخرجة باستخدام Git/الملف الجاهز.
