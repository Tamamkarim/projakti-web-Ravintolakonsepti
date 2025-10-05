# مشروع مفهوم المطعم - Restaurant Concept

## وصف المشروع

مشروع تطبيق ويب شامل لإدارة المطعم يتضمن:

- واجهة أمامية تفاعلية (Frontend)
- خادم خلفي (Backend API)
- نظام إدارة المحتوى
- نظام المصادقة والترخيص

## هيكل المشروع

```
├── Backend/                 # الخادم الخلفي
│   ├── server.js           # ملف الخادم الرئيسي
│   ├── routes/             # مسارات API
│   ├── package.json        # تبعيات Backend
│   └── .env               # متغيرات البيئة
├── frontend/               # الواجهة الأمامية
│   ├── index.html         # الصفحة الرئيسية
│   ├── admin.html         # لوحة الإدارة
│   ├── css/               # ملفات التنسيق
│   ├── js/                # ملفات JavaScript
│   └── assets/            # الصور والملفات الثابتة
├── docs/                   # التوثيق
├── package.json           # تبعيات المشروع الرئيسية
├── .env                   # متغيرات البيئة الرئيسية
└── README.md              # هذا الملف
```

## التثبيت والإعداد

### 1. تثبيت التبعيات

```bash
# تثبيت جميع التبعيات
npm run install-all

# أو تثبيت كل قسم منفصل
npm install
npm run install-backend
```

### 2. إعداد متغيرات البيئة

قم بتعديل ملف `.env` في المجلد الجذر و `Backend/.env` حسب إعداداتك:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. تشغيل المشروع

#### للتطوير (Development)

```bash
# تشغيل الخادم مع إعادة التحميل التلقائي
npm run dev
```

#### للإنتاج (Production)

```bash
# تشغيل الخادم
npm start
```

#### تشغيل Backend فقط

```bash
npm run backend
```

## الميزات الرئيسية

### Frontend

- ✅ واجهة مستخدم تفاعلية
- ✅ تصميم متجاوب (Responsive)
- ✅ نظام سلة التسوق
- ✅ صفحة إدارة
- ✅ PWA Support (Progressive Web App)

### Backend

- ✅ Express.js API Server
- ✅ نظام المصادقة (JWT)
- ✅ حماية المسارات
- ✅ إدارة المحتوى
- ✅ خدمة الملفات الثابتة

## المسارات (API Endpoints)

### المصادقة

- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول

### الإدارة

- `GET /api/admin/secret` - مسار محمي للإدارة

### الوصفات والقوائم

- `GET /api/menu/today` - قائمة اليوم
- `POST /api/orders` - إنشاء طلب جديد

## التقنيات المستخدمة

### Frontend

- HTML5, CSS3, JavaScript (ES6+)
- Service Worker (PWA)
- Responsive Design

### Backend

- Node.js
- Express.js
- JWT (JSON Web Tokens)
- dotenv

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. إنشاء Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة ISC

## الدعم

للحصول على الدعم، يرجى فتح issue في المستودع أو التواصل مع فريق التطوير.

---

## ملاحظات التطوير

### إضافة ميزات جديدة

- أضف مسارات API جديدة في مجلد `Backend/routes/`
- أضف صفحات HTML جديدة في مجلد `frontend/`
- أضف تنسيقات CSS في `frontend/css/`
- أضف وظائف JavaScript في `frontend/js/`

### نصائح الأمان

- غيّر `JWT_SECRET` في ملف `.env` قبل الإنتاج
- استخدم HTTPS في بيئة الإنتاج
- قم بتحديث التبعيات بانتظام

### الأداء

- استخدم compression middleware للإنتاج
- فعّل caching للملفات الثابتة
- قم بتحسين الصور في مجلد `assets/`
