# Part 4: Layout & Navigation - Documentation

## 📋 Overview

This document details the implementation of Layout & Navigation system for the eBook Frontend application. The system includes responsive layouts for public, user, and admin sections with sidebars, breadcrumbs, and smooth animations.

---

## ✅ Completed Features

### 1. **Public Layout** (`src/components/layout/PublicLayout.jsx`)
- Layout for public pages (Home, Products, etc.)
- Includes Navbar and Footer
- Framer Motion page transitions
- Theme-compatible styling

### 2. **User Layout** (`src/components/layout/UserLayout.jsx`)
- Layout for authenticated user pages
- Includes Navbar, Sidebar, and Breadcrumbs
- Responsive sidebar with mobile menu
- Smooth animations
- Mobile sidebar toggle button

### 3. **Admin Layout** (`src/components/layout/AdminLayout.jsx`)
- Layout for admin pages
- Includes Navbar, Sidebar, and Breadcrumbs
- Responsive sidebar with mobile menu
- Smooth animations
- Mobile sidebar toggle button

### 4. **Sidebar Component** (`src/components/layout/Sidebar.jsx`)
- Reusable sidebar for both user and admin
- User sidebar menu items:
  - Dashboard
  - Profile
  - My Orders
  - My eBooks
  - Addresses
- Admin sidebar menu items:
  - Dashboard
  - Products
  - Categories
  - Orders
  - Users
  - Affiliates
  - Coupons
- Active route highlighting
- User info display (for user sidebar)
- Icon support for each menu item
- Framer Motion animations

### 5. **Breadcrumbs Component** (`src/components/layout/Breadcrumbs.jsx`)
- Automatic breadcrumb generation from route
- Shows current page location
- Clickable navigation
- Translates common paths
- Hides on home page
- Smooth animations

### 6. **Updated Routes** (`src/routes/AppRoutes.jsx`)
- Public routes use `PublicLayout`
- User routes use `UserLayout` (with ProtectedRoute)
- Admin routes use `AdminLayout` (with AdminRoute)
- Nested routes for dashboard and admin sections

### 7. **Translations**
- Added navigation keys for sidebar items
- English and Bangla translations
- Breadcrumb translations

---

## 🔧 How It Works

### Layout Structure:

1. **Public Layout:**
   ```
   PublicLayout
   ├── Navbar
   ├── Main Content (with animations)
   └── Footer
   ```

2. **User Layout:**
   ```
   UserLayout
   ├── Navbar
   └── Content Area
       ├── Sidebar (Desktop: always visible, Mobile: toggle)
       └── Main Content
           ├── Breadcrumbs
           └── Page Content (with animations)
   ```

3. **Admin Layout:**
   ```
   AdminLayout
   ├── Navbar
   └── Content Area
       ├── Sidebar (Desktop: always visible, Mobile: toggle)
       └── Main Content
           ├── Breadcrumbs
           └── Page Content (with animations)
   ```

### Route Configuration:

- **Public Routes:** Use `PublicLayout` (Home, Products, Login, Register)
- **User Routes:** Use `UserLayout` wrapped in `ProtectedRoute` (Dashboard, Profile, Orders, etc.)
- **Admin Routes:** Use `AdminLayout` wrapped in `AdminRoute` (Admin Dashboard, Products, etc.)

### Sidebar Behavior:

- **Desktop (lg and above):** Sidebar always visible on the left
- **Mobile (below lg):** Sidebar hidden by default, toggle button in bottom-right
- **Mobile Overlay:** Dark overlay when sidebar is open
- **Smooth Animation:** Spring animation for sidebar slide-in/out

### Breadcrumbs:

- Automatically generated from current route
- Translates common paths (dashboard, profile, orders, etc.)
- Clickable navigation to parent routes
- Hidden on home page (`/`)

---

## 📁 Files Created

```
src/
├── components/
│   └── layout/
│       ├── PublicLayout.jsx (NEW)
│       ├── UserLayout.jsx (NEW)
│       ├── AdminLayout.jsx (NEW)
│       ├── Sidebar.jsx (NEW)
│       ├── Breadcrumbs.jsx (NEW)
│       ├── Navbar.jsx (existing)
│       ├── Footer.jsx (existing)
│       └── RootLayout.jsx (updated - now alias for PublicLayout)
└── routes/
    └── AppRoutes.jsx (updated)
```

---

## 🎨 Features

### Responsive Design:
- ✅ Desktop: Sidebar always visible
- ✅ Mobile: Sidebar toggle with overlay
- ✅ Smooth transitions
- ✅ Touch-friendly buttons

### Animations:
- ✅ Page transitions (Framer Motion)
- ✅ Sidebar slide animations
- ✅ Menu item stagger animations
- ✅ Breadcrumb fade-in

### User Experience:
- ✅ Active route highlighting
- ✅ User info display in sidebar
- ✅ Breadcrumb navigation
- ✅ Mobile-friendly sidebar
- ✅ Theme-compatible colors

### Accessibility:
- ✅ ARIA labels
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management

---

## 🧪 Testing

### Test Cases:

1. **Public Layout:**
   - [ ] Home page shows Navbar and Footer
   - [ ] Products page shows Navbar and Footer
   - [ ] Page transitions are smooth
   - [ ] Theme switching works

2. **User Layout:**
   - [ ] Dashboard shows sidebar and breadcrumbs
   - [ ] Sidebar menu items are clickable
   - [ ] Active route is highlighted
   - [ ] Mobile sidebar toggle works
   - [ ] Breadcrumbs show correct path
   - [ ] User info displays in sidebar

3. **Admin Layout:**
   - [ ] Admin dashboard shows sidebar and breadcrumbs
   - [ ] Admin sidebar menu items are clickable
   - [ ] Active route is highlighted
   - [ ] Mobile sidebar toggle works
   - [ ] Breadcrumbs show correct path

4. **Responsive:**
   - [ ] Desktop sidebar always visible
   - [ ] Mobile sidebar hidden by default
   - [ ] Mobile toggle button works
   - [ ] Overlay closes sidebar on click
   - [ ] All breakpoints work correctly

5. **Animations:**
   - [ ] Page transitions smooth
   - [ ] Sidebar animations smooth
   - [ ] Menu items animate in
   - [ ] No layout shifts

6. **Translations:**
   - [ ] All sidebar items translated
   - [ ] Breadcrumbs translated
   - [ ] Language switching works

---

## 📝 Route Structure

### Public Routes:
- `/` - Home (PublicLayout)
- `/products` - Products (PublicLayout)
- `/login` - Login (PublicLayout)
- `/register` - Register (PublicLayout)
- `/verify-otp` - OTP Verification (PublicLayout)

### User Routes (Protected):
- `/dashboard` - Dashboard (UserLayout)
- `/dashboard/profile` - Profile (UserLayout)
- `/dashboard/orders` - Orders (UserLayout)
- `/dashboard/ebooks` - eBooks (UserLayout)
- `/dashboard/addresses` - Addresses (UserLayout)

### Admin Routes (Protected):
- `/admin` - Admin Dashboard (AdminLayout)
- `/admin/products` - Products Management (AdminLayout)
- `/admin/categories` - Categories Management (AdminLayout)
- `/admin/orders` - Orders Management (AdminLayout)
- `/admin/users` - Users Management (AdminLayout)
- `/admin/affiliates` - Affiliates Management (AdminLayout)
- `/admin/coupons` - Coupons Management (AdminLayout)

---

## 🎯 Next Steps

- **Part 5: Product Management (Public)** - Product listing, search, filter, and detail pages

---

## 📚 Related Documentation

- [Part 1: Project Setup & Configuration](./PART1_DOCUMENTATION.md)
- [Part 2: Core Infrastructure](./PART2_DOCUMENTATION.md)
- [Part 3: Authentication System](./PART3_DOCUMENTATION.md)

---

**Part 4 Status:** ✅ Complete  
**Date Completed:** Current Session  
**Next Part:** Part 5 - Product Management (Public)

