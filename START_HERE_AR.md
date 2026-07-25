# SBTS Master — GitHub + Railway

هذه النسخة مجهزة لتعمل بنفس أسلوب SBTS_v1:

1. فك الضغط في مسار ثابت، ويفضل: `C:\Projects\SBTS\SBTS-Master`
2. افتح المجلد نفسه في VS Code.
3. شغّل `01_CONNECT_GITHUB_ONCE.cmd` مرة واحدة فقط.
4. اربط Railway بالمستودع `abadya3-code/SBS` وفرع `main`، وأضف MySQL والمتغيرات الموضحة في `RAILWAY_SETUP_AR.md`.
5. بعد ذلك، أي تحديث مستقبلي يكون فقط بنسخ الملفات الجديدة داخل هذا المجلد ثم تشغيل `02_PUSH_UPDATE.cmd`.

## مهم

- لا تنسخ إلى المجلد: `.env` أو `node_modules` أو `dist`.
- مجلد `.git` موجود ومجهز داخل النسخة، لكنه لا يحتوي أسرار تسجيل الدخول.
- أول سكربت يتبنى تاريخ المستودع الحالي من GitHub ثم يحفظ هذه النسخة فوقه بعملية Commit عادية، دون Force Push.
- Railway تقرأ `railway.json` وتنفذ البناء، migrations، إنشاء أول Admin، ثم health check.
