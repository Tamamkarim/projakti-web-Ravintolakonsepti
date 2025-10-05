// Middleware tietojen validointiin
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of fields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Pakolliset kentät puuttuvat',
        missingFields: missingFields,
        message: `Seuraavat kentät ovat pakollisia: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

// Middleware sähköpostin muodon tarkistukseen
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Sähköpostin muoto on virheellinen'
      });
    }
  }
  
  next();
};

// Middleware salasanan vahvuuden tarkistukseen
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Salasanan tulee olla vähintään 6 merkkiä pitkä'
      });
    }
  }
  
  next();
};

// Middleware لتحديد معدل الطلبات
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // تنظيف الطلبات القديمة
    for (const [ip, timestamps] of requests.entries()) {
      requests.set(ip, timestamps.filter(time => time > windowStart));
      if (requests.get(ip).length === 0) {
        requests.delete(ip);
      }
    }
    
    // فحص الطلبات الحالية
    const clientRequests = requests.get(clientIp) || [];
    
    if (clientRequests.length >= max) {
      return res.status(429).json({
        error: 'تم تجاوز عدد الطلبات المسموح',
        retryAfter: Math.ceil((clientRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // إضافة الطلب الحالي
    clientRequests.push(now);
    requests.set(clientIp, clientRequests);
    
    next();
  };
};

// Middleware لتسجيل الأخطاء
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: err.message,
      stack: err.stack
    }
  };
  
  console.error('خطأ في الخادم:', JSON.stringify(errorLog, null, 2));
  
  next(err);
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  rateLimit,
  errorLogger
};