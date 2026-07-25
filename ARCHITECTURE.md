# SBTS Professional — Architecture Guide

> **للمهندس القادم:** هذا الملف يشرح هيكل المشروع بالكامل. اقرأه قبل أي تعديل.
> للاطلاع على تاريخ التغييرات والمراحل المنجزة، راجع [CHANGELOG.md](./CHANGELOG.md).

---

## نظرة عامة

**SBTS** (Smart Blind Tracking System) هو نظام ويب لإدارة ومتابعة عمليات تركيب وفحص الـ Blinds في المنشآت الصناعية. يتيح للمهندسين والفنيين تتبع كل Blind عبر مراحل العمل المختلفة مع نظام صلاحيات متكامل.

**Stack التقني:**

| الطبقة | التقنية |
|--------|---------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Express 4 + tRPC 11 |
| قاعدة البيانات | MySQL (TiDB) عبر Drizzle ORM |
| المصادقة | Manus OAuth 2.0 |
| الاختبارات | Vitest |

---

## هيكل الملفات

```
sbts-professional/
├── client/                    ← Frontend (React)
│   └── src/
│       ├── _core/hooks/       ← useAuth hook
│       ├── components/
│       │   ├── dashboard/     ← مكونات لوحة التحكم
│       │   ├── layout/        ← AppShell (الهيكل العام)
│       │   ├── reports/       ← مكونات التقارير
│       │   ├── theme/         ← ThemeToggle
│       │   └── ui/            ← shadcn/ui components
│       ├── pages/             ← صفحات التطبيق (انظر قسم الصفحات)
│       ├── App.tsx            ← Routes + Layout
│       ├── const.ts           ← getLoginUrl, ثوابت Frontend
│       ├── index.css          ← Global styles + CSS variables
│       └── main.tsx           ← tRPC + QueryClient providers
│
├── server/
│   ├── _core/                 ← Framework plumbing (لا تعدّل)
│   │   ├── index.ts           ← Express entry point
│   │   ├── context.ts         ← tRPC context (ctx.user)
│   │   ├── trpc.ts            ← publicProcedure, protectedProcedure, adminProcedure
│   │   ├── oauth.ts           ← Manus OAuth flow
│   │   ├── notification.ts    ← notifyOwner helper
│   │   ├── llm.ts             ← invokeLLM helper
│   │   ├── imageGeneration.ts ← generateImage helper
│   │   └── systemRouter.ts    ← system.notifyOwner procedure
│   │
│   ├── db/                    ← Database layer (مقسّم منطقياً)
│   │   ├── index.ts           ← Barrel: re-exports كل شيء
│   │   ├── core.ts            ← getDb, requireDb, upsertUser, getUserByOpenId
│   │   ├── types.ts           ← جميع الـ interfaces والـ types
│   │   ├── blinds.ts          ← Blind CRUD, phase approvals, constants
│   │   ├── projects.ts        ← Areas, Projects, Project settings
│   │   ├── workflows.ts       ← Workflow templates CRUD
│   │   ├── settings.ts        ← System/Tag/Certificate settings
│   │   ├── users.ts           ← User management, roles, registration
│   │   └── seed.ts            ← Seed data وseed functions
│   │
│   ├── routers/               ← tRPC routers (مقسّم منطقياً)
│   │   ├── index.ts           ← appRouter الرئيسي + AppRouter type
│   │   ├── shared.ts          ← Zod schemas مشتركة
│   │   ├── access-control.ts  ← Roles, permissions, registration
│   │   ├── areas.ts           ← Plant areas CRUD
│   │   ├── projects.ts        ← Projects, blinds, phase approvals
│   │   ├── workflows.ts       ← Workflow templates
│   │   └── settings.ts        ← System/Tag/Certificate settings
│   │
│   ├── db.ts                  ← Barrel: re-export من server/db/
│   ├── routers.ts             ← Barrel: re-export من server/routers/
│   ├── storage.ts             ← S3 helpers (storagePut, storageGet)
│   └── *.test.ts              ← Vitest tests (12 ملف، 69 اختبار)
│
├── drizzle/
│   ├── schema.ts              ← 17 جدول (انظر قسم قاعدة البيانات)
│   ├── relations.ts           ← Drizzle relations
│   └── *.sql                  ← Migration files
│
├── shared/                    ← كود مشترك بين Frontend وBackend
│   ├── const.ts               ← COOKIE_NAME, UNAUTHED_ERR_MSG, ...
│   ├── types.ts               ← Shared TypeScript types
│   ├── blindBulkPaste.ts      ← Bulk paste parser
│   ├── electronicApprovals.ts ← Electronic approval logic
│   └── pdfExports.ts          ← PDF export helpers
│
├── ARCHITECTURE.md            ← هذا الملف
├── CHANGELOG.md               ← تاريخ المشروع والمراحل
└── todo.md                    ← المهام المتبقية
```

---

## صفحات التطبيق

| الصفحة | المسار | الوصف | الصلاحية |
|--------|--------|-------|----------|
| `Login.tsx` | `/login` | صفحة الدخول عبر Manus OAuth | عام |
| `Register.tsx` | `/register` | نموذج إكمال بيانات التسجيل | مسجّل دخول |
| `Approve.tsx` | `/approve` | انتظار موافقة المدير | مسجّل دخول |
| `Home.tsx` | `/` | لوحة التحكم الرئيسية | نشط |
| `Dashboard.tsx` | `/dashboard` | إحصائيات وملخص المشاريع | نشط |
| `Areas.tsx` | `/areas` | إدارة المناطق | نشط |
| `Projects.tsx` | `/projects` | قائمة المشاريع | نشط |
| `ProjectDetail.tsx` | `/projects/:id` | تفاصيل مشروع وقائمة Blinds | نشط |
| `Blinds.tsx` | `/blinds` | قائمة Blinds الكاملة | نشط |
| `BlindDetailHub.tsx` | `/projects/:id/blinds/:tag` | تفاصيل Blind والـCanonical Runtime | نشط |
| `WorkflowStudio.tsx` | `/workflow-studio` | إنشاء وتعديل قوالب Workflow | نشط |
| `AccessControl.tsx` | `/access-control` | إدارة الأدوار والصلاحيات | Admin |
| `UserManagement.tsx` | `/users` | إدارة المستخدمين وطلبات التسجيل | Admin |
| `SystemSettings.tsx` | `/settings` | إعدادات النظام والشهادة | Admin |
| `NotFound.tsx` | `*` | صفحة 404 | عام |

---

## قاعدة البيانات

**17 جدول** في `drizzle/schema.ts`:

| الجدول | الوصف |
|--------|-------|
| `users` | المستخدمون مع `userStatus` (pending/active/rejected) وبيانات التسجيل |
| `areas` | المناطق في المنشأة |
| `projects` | المشاريع مع status وprogress |
| `blinds` | الـ Blinds مع جميع خصائصها ومراحلها |
| `projectPhaseOwners` | مالكو كل مرحلة في كل مشروع |
| `projectSettings` | إعدادات كل مشروع (slipBlindGateRequired, ...) |
| `blindWorkflowLogs` | سجل تغييرات مراحل الـ Blinds |
| `blindPhaseApprovals` | الموافقات الإلكترونية على المراحل |
| `accessPermissions` | الصلاحيات المتاحة في النظام |
| `accessRoles` | الأدوار (admin, technician, qc, ...) |
| `accessRolePermissions` | ربط الأدوار بالصلاحيات |
| `workflowTemplates` | قوالب سير العمل |
| `workflowPhases` | مراحل كل قالب workflow |
| `systemSettings` | إعدادات النظام العامة |
| `defaultTagSettings` | إعدادات توليد Tag تلقائياً |
| `certificateSettings` | إعدادات شهادة الإنجاز |
| `userRoleAssignments` | ربط المستخدمين بالأدوار |

---

## نظام المصادقة وسير التسجيل

```
مستخدم جديد
    │
    ▼
[Manus OAuth] ──→ upsertUser() ──→ userStatus = null (لم يكمل التسجيل)
    │
    ▼
AppShell auth guard:
    ├── userStatus = null      → /register  (إكمال البيانات)
    ├── userStatus = 'pending' → /approve   (انتظار الموافقة)
    ├── userStatus = 'rejected'→ /approve   (مع رسالة الرفض)
    └── userStatus = 'active'  → التطبيق الكامل
    │
    ▼ (بعد /register)
completeUserRegistration() → userStatus = 'pending'
    + إشعار للمدير عبر notifyOwner()
    │
    ▼ (المدير في /users)
approveUserRegistration() → userStatus = 'active'
    أو
rejectUserRegistration()  → userStatus = 'rejected'
```

---

## نظام الصلاحيات

**ثلاثة مستويات:**

**1. System Role** (في جدول `users.role`):
- `admin` — وصول كامل لكل شيء
- `user` — وصول محدود بالأدوار المخصصة

**2. Access Roles** (في جدول `accessRoles`):
أدوار مخصصة لكل مستخدم تحدد:
- `permissionKeys` — الصلاحيات المتاحة
- `menuKeys` — عناصر القائمة المرئية
- `phaseKeys` — مراحل Blind التي يمكن التعديل عليها

**3. Phase Owners** (في جدول `projectPhaseOwners`):
لكل مشروع، يُحدد مالك كل مرحلة. فقط المالك يمكنه إضافة/تعديل Blinds في مرحلته.

**في الـ tRPC:**
```ts
publicProcedure    // بدون مصادقة
protectedProcedure // يتطلب تسجيل دخول (ctx.user متاح)
adminProcedure     // يتطلب role = 'admin'
```

---

## مراحل الـ Blind

```
Broken / Preparation
    ↓
Assembly
    ↓
Tight & Torque
    ↓
Final Tight
    ↓
Inspection Ready ✓
```

كل مرحلة لها:
- **Phase Owner** مخصص لكل مشروع
- **Electronic Approval** — توقيع رقمي لإتمام المرحلة
- **Workflow Log** — سجل كامل بكل تغيير

---

## قواعد التطوير

**إضافة ميزة جديدة:**
1. أضف الجدول في `drizzle/schema.ts` ثم شغّل `pnpm db:push`
2. أضف helper functions في الملف المناسب داخل `server/db/`
3. أضف procedures في الملف المناسب داخل `server/routers/`
4. أنشئ الصفحة في `client/src/pages/` واستخدم `trpc.*.useQuery/useMutation`
5. سجّل الـ route في `client/src/App.tsx`
6. اكتب اختبار Vitest في `server/*.test.ts`

**قواعد مهمة:**
- **لا تعدّل** أي ملف داخل `server/_core/` إلا لأسباب بنيوية
- **استخدم** `protectedProcedure` لكل procedure تحتاج مستخدماً مسجلاً
- **استخدم** `adminProcedure` لكل procedure تحتاج صلاحية admin
- **لا تخزّن** ملفات في قاعدة البيانات — استخدم `storagePut()` من `server/storage.ts`
- **جميع الـ timestamps** تُخزَّن كـ UTC milliseconds

---

## تشغيل المشروع محلياً

```bash
pnpm install          # تثبيت الاعتماديات
pnpm db:push          # تطبيق migrations
pnpm dev              # تشغيل dev server (port 3000)
pnpm test             # تشغيل Vitest (69 اختبار)
pnpm build            # بناء للإنتاج
```

## Sprint 1 canonical workflow foundation

The canonical workflow source is now `shared/workflowSpecification.ts`. Do not create new hardcoded phase arrays in pages, routers or reports.

The eight-phase template is persisted in `workflow_templates` / `workflow_phases` as `wf-sbts-standard-v2`. Plant safety policy is stored in the singleton `workflow_policy_settings` table and managed from **System Settings → Workflow & Safety**.

The legacy `blinds.phase` enum remains temporarily in use. Runtime migration to phase instances and server transition guards is the next architecture milestone. See `docs/DATA_LINKAGE_MAP.md` and `docs/SBTS_WORKFLOW_SPECIFICATION_V1.md`.


---

## Sprint 2 Canonical Workflow Runtime

### Authority boundary

The table `blind_workflow_runtime` is the authoritative source for the current canonical phase, lifecycle status, record version and lock state. The legacy `blinds.phase` field is updated only as a compatibility projection for older reports and components. Direct legacy phase mutations are rejected by both router and database service layers.

### Core domain flow

```text
projects
  └─ project_workflow_assignments
      └─ blind_workflow_runtime
          ├─ blind_phase_instances
          ├─ blind_checklist_responses
          ├─ workflow_transition_events
          ├─ permit_records / loto_records / gas_test_records
          ├─ torque_records / leak_test_records
          ├─ safety_holds
          ├─ workflow_approval_steps
          └─ workflow_evidence_attachments

isolation_packages
  ├─ isolation_package_blinds
  └─ entry_readiness_records
```

### Command model

Clients do not submit a target phase. They submit one approved command such as `completeInitialIsolation`, `approveMechanicalVerification`, or `authorizeReturnToService` together with the expected runtime record version. The server maps the command to the current phase, evaluates all gates, verifies RBAC, persists a transition event and updates the compatibility phase in one database transaction.

### Concurrency and locking

- `recordVersion` provides optimistic concurrency.
- Closed workflows are locked and cannot receive normal transitions.
- Safety Holds freeze progression and require controlled release.
- Final return to service locks the runtime record.

### Database compatibility

Migration `0014` avoids `JSON_TABLE` and materializes canonical checklist rows through portable derived `UNION ALL` data, supporting the documented TiDB/MySQL deployment target. Migration application must still be tested against the exact Staging database version before Production.

### Settings ownership

`workflow_policy_settings` is a database-backed singleton consumed by the server engine and the frontend. It controls workflow adapter selection, gate enforcement, PTW/LOTO/gas-test policies, gas acceptance limits, package behavior, Safety Hold governance, final approvals and workflow UI presentation.


---

## Sprint 3 Vertical Integration & Field Operations

### Runtime presentation

`BlindDetailHub` remains the single current Blind workspace. Its Field Actions tab mounts `WorkflowOperationsPanel`, which composes canonical runtime records rather than maintaining independent client-only state. Every operational mutation refetches the workflow runtime so gates, permissions and lifecycle status remain server-derived.

### New field modules

```text
WorkflowOperationsPanel
  ├─ Permit editor
  ├─ LOTO editor
  ├─ Gas-test editor
  ├─ Torque execution / independent verification
  ├─ InspectionActivitiesPanel
  ├─ Leak/service-test editor
  ├─ Isolation Package / entry-readiness summary
  ├─ Sequential approvals
  └─ Current-phase evidence
```

### Inspection configuration

`inspection_activity_templates` is the plant configuration catalog. `inspection_activity_records` stores Blind-specific execution. Activities may be mandatory, evidence-controlled and independently approved. Approval-required activities are not gate-complete until a different authorized user approves them.

### Isolation Packages

The dedicated `/isolation-packages` page reads package state from `isolation_packages`, `isolation_package_blinds`, `entry_readiness_records` and each linked Blind runtime. Package readiness is derived on the server and cannot be declared solely by the browser.

### Evidence storage boundary

Evidence binary content is placed through `storagePut`; metadata and audit history are stored in the database. Deleting evidence currently removes the metadata record only. Add storage deletion/orphan lifecycle before Production.

### Settings ownership

Sprint 3 adds database-backed evidence policy, field units, editor mode and Inspection Activity Builder. New pages continue using the existing global theme tokens. Dialog field entry is the supported mode; inline mode is reserved for a future compact field workflow.

---

## Sprint 4 Production Governance Layer

Sprint 4 adds a controlled quality and certificate layer above the canonical workflow runtime:

```text
Blind Workflow Runtime
  -> Inspection Activities
  -> Defect / Punch / NDT Governance
  -> Leak Test + Final Approval Chain
  -> Certificate Readiness
  -> Immutable Certificate Snapshot + SHA-256
  -> Public Data-Minimized Verification
```

### Certificate boundary

The full certificate snapshot remains controlled in `certificate_records.snapshotJson`. Public verification receives only the minimum identity, final governance, leak-test and quality-summary fields required to validate the issued record. Permit, LOTO, gas-test readings, evidence URLs and internal user identifiers remain private.

### Quality boundary

Defect, punch and NDT records use independent review rules and `recordVersion` optimistic concurrency. Final workflow closure and certificate issue evaluate plant-configurable quality gates server-side.

### Deployment boundary

Production startup requires database, authentication and object-storage configuration. `/health` reports process availability; `/ready` verifies database connectivity. Railway uses `railway.json` for build, pre-deploy migrations, start and health-check configuration.

### Migration boundary

Drizzle manages the original schema journal. Sprint domain migrations (`0013_sprint*` onward) are applied by `scripts/apply-sbts-domain-migrations.ts`, which records both file checksums and statement-level checksums in:

- `sbts_domain_migrations`
- `sbts_domain_migration_steps`

This prevents silent omission and allows an interrupted deployment to resume from the last recorded statement. Previously manually applied migrations may be baselined only through the explicit `SBTS_DOMAIN_MIGRATION_BASELINE_UP_TO` variable after schema verification and backup.
