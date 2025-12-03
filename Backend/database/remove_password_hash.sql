-- حذف عمود password_hash من جدول المستخدمين (users)
ALTER TABLE users DROP COLUMN password_hash;
