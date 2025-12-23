# 🚀 Netlify Deployment Guide - eBook Frontend

## ✅ **Backend URL Configured**

Frontend এখন production backend ব্যবহার করবে:
- **Backend URL:** `https://e-book-backend-tau.vercel.app/api`

---

## 📋 **Netlify Deployment Steps:**

### **STEP 1: GitHub Repository Connect**

1. **Netlify Dashboard** → https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **GitHub** select করুন
4. আপনার `eBook_Frontend` repository select করুন
5. **Import** করুন

---

### **STEP 2: Build Settings**

Netlify automatically detect করবে, কিন্তু verify করুন:

**Build Settings:**
- **Base directory:** (leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

**Or manually set:**
```
Build command: npm run build
Publish directory: dist
```

---

### **STEP 3: Environment Variables (Optional)**

Netlify Dashboard → **Site settings** → **Environment variables**:

**Add if needed:**
```
VITE_API_BASE_URL=https://e-book-backend-tau.vercel.app/api
```

**Note:** Default-এ production URL already set আছে `constants.js`-এ, তাই optional।

---

### **STEP 4: Deploy**

1. **Deploy site** button click করুন
2. Wait করুন (2-3 minutes)
3. Deployment complete হলে site URL পাবেন

---

## 🔧 **Configuration Files:**

### **netlify.toml**
- ✅ Build settings configured
- ✅ SPA redirect rules (React Router)
- ✅ Security headers
- ✅ Cache headers for static assets

### **.env.example**
- ✅ Template for environment variables
- ✅ Production backend URL as default

---

## 🧪 **After Deployment - Test:**

### **1. Homepage:**
```
https://your-site.netlify.app
```

### **2. API Connection:**
- Login/Register test করুন
- Products load হচ্ছে কিনা check করুন
- Database connection verify করুন

---

## 🔍 **Troubleshooting:**

### **Issue 1: Build Fails**

**Check:**
- Node version (Netlify uses Node 18 by default)
- Build command: `npm run build`
- Dependencies installed properly

**Solution:**
- Netlify Dashboard → **Site settings** → **Build & deploy** → **Environment**
- Set `NODE_VERSION = 18`

---

### **Issue 2: 404 on Routes**

**Problem:** React Router routes show 404

**Solution:**
- `netlify.toml`-এ redirect rules আছে
- Verify `[[redirects]]` section

---

### **Issue 3: API Connection Fails**

**Check:**
- Backend URL correct: `https://e-book-backend-tau.vercel.app/api`
- CORS enabled in backend
- Network tab-এ error messages

**Solution:**
- Backend-এ CORS allow করুন frontend domain
- Environment variable set করুন Netlify-এ

---

### **Issue 4: Environment Variables Not Working**

**Problem:** `VITE_` prefix missing

**Solution:**
- All variables must start with `VITE_`
- Redeploy after adding variables

---

## 📝 **Netlify Environment Variables:**

### **Required (Optional - already in code):**
```
VITE_API_BASE_URL=https://e-book-backend-tau.vercel.app/api
```

### **Optional:**
```
VITE_APP_NAME=eBook Store
VITE_FRONTEND_URL=https://your-site.netlify.app
VITE_DEBUG_MODE=false
```

---

## ✅ **Deployment Checklist:**

- [ ] GitHub repository connected
- [ ] Build settings correct (`npm run build`, `dist`)
- [ ] Environment variables set (optional)
- [ ] Deployment successful
- [ ] Homepage loads
- [ ] API connection works
- [ ] Routes work (no 404)
- [ ] Login/Register works

---

## 🎯 **Quick Deploy:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update: Frontend ready for Netlify deployment"
   git push
   ```

2. **Netlify Auto-Deploy:**
   - Netlify automatically detect করবে
   - Build start হবে
   - 2-3 minutes wait করুন

3. **Get Site URL:**
   - Netlify Dashboard → Your site → **Site overview**
   - Site URL দেখবেন: `https://your-site.netlify.app`

---

## 🔗 **Links:**

- **Backend API:** https://e-book-backend-tau.vercel.app/api
- **Backend Health:** https://e-book-backend-tau.vercel.app/api/health
- **Netlify Dashboard:** https://app.netlify.com

---

**Last Updated:** After configuring for Netlify deployment with Vercel backend

