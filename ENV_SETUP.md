# Frontend Environment Variables Setup

## ✅ **Production Backend URL Updated**

Frontend code এখন production backend URL ব্যবহার করবে:
- **Production Backend:** `https://e-book-backend-tau.vercel.app/api`

## 📝 **Manual .env File Setup (Optional)**

যদি আপনি local development-এ different backend URL ব্যবহার করতে চান, তাহলে `.env` file তৈরি করুন:

### **Steps:**

1. **`.env` file তৈরি করুন** `eBook_Frontend` folder-এ:

```env
# Production Backend API URL
VITE_API_BASE_URL=https://e-book-backend-tau.vercel.app/api

# Local Development (uncomment to use localhost)
# VITE_API_BASE_URL=https://e-book-backend-tau.vercel.app/api

# Frontend URL
VITE_FRONTEND_URL=http://localhost:3000

# Application Configuration
VITE_APP_NAME=eBook Store
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

2. **Development server restart করুন**:
```bash
npm run dev
```

## 🔄 **How It Works:**

1. **Environment Variable Priority:**
   - যদি `.env` file-এ `VITE_API_BASE_URL` থাকে, সেটা ব্যবহার হবে
   - যদি না থাকে, production build-এ production URL ব্যবহার হবে
   - Development mode-এ localhost ব্যবহার হবে

2. **Current Configuration:**
   - ✅ Production: `https://e-book-backend-tau.vercel.app/api` (default)
   - ✅ Development: `.env` file-এ `VITE_API_BASE_URL=https://e-book-backend-tau.vercel.app/api` set করুন (optional)

## 🚀 **For Netlify Deployment:**

Netlify-এ frontend deploy করার সময়, environment variable হিসেবে set করুন (optional):

```
VITE_API_BASE_URL=https://e-book-backend-tau.vercel.app/api
```

**Note:** Default-এ production URL already set আছে, তাই optional।

## ✅ **What's Updated:**

1. ✅ `src/utils/constants.js` - Production URL as default
2. ✅ `src/services/ebookService.js` - Uses API_BASE_URL from constants
3. ✅ Automatic production/development detection

## 📌 **Note:**

- `.env` file `.gitignore`-এ আছে, তাই git-এ commit হবে না
- Production build-এ automatically production URL (`https://e-book-backend-tau.vercel.app/api`) ব্যবহার হবে
- Local development-এ production URL ব্যবহার হবে (`.env` file-এ localhost set করতে পারেন)

