# eBook Frontend

A modern, responsive React-based e-commerce frontend application for physical and digital product sales, featuring eBook reading, affiliate program, and comprehensive admin panel.

## 🚀 Project Overview

This frontend application provides a complete e-commerce solution with the following features:

- **Product Browsing** - Beautiful product catalog with search, filters, and pagination
- **Shopping Cart** - Persistent cart with coupon support
- **Order Management** - Complete order tracking and history
- **eBook Reading** - Secure PDF viewer with watermarking
- **Affiliate Program** - Referral tracking and commission dashboard
- **Admin Panel** - Comprehensive admin dashboard with analytics
- **Multi-language Support** - English and Bangla (বাংলা)
- **Dark/Light Mode** - Theme switching with system preference detection
- **Responsive Design** - Mobile-first, fully responsive UI

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd eBook_Frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# For production, use your deployed backend URL
# VITE_API_URL=https://your-backend-api.vercel.app/api
```

### Step 4: Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000` (or the next available port).

### Step 5: Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` folder.

### Step 6: Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
eBook_Frontend/
├── public/              # Static assets
│   ├── pdf.worker.min.mjs
│   └── _redirects
│
├── src/
│   ├── components/     # React components
│   │   ├── admin/      # Admin components
│   │   ├── affiliate/  # Affiliate components
│   │   ├── auth/       # Authentication components
│   │   ├── cart/       # Cart components
│   │   ├── common/     # Reusable components
│   │   ├── coupons/    # Coupon components
│   │   ├── ebook/      # eBook components
│   │   ├── home/       # Home page components
│   │   ├── layout/     # Layout components
│   │   ├── orders/     # Order components
│   │   ├── products/   # Product components
│   │   └── user/       # User components
│   │
│   ├── context/        # React contexts
│   │   ├── LanguageContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useProducts.js
│   │   └── useThemeColors.js
│   │
│   ├── i18n/           # Internationalization
│   │   ├── config.js
│   │   └── locales/
│   │       ├── en/
│   │       │   └── translation.json
│   │       └── bn/
│   │           └── translation.json
│   │
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── auth/       # Authentication pages
│   │   ├── user/       # User pages
│   │   └── ...         # Public pages
│   │
│   ├── routes/         # Routing configuration
│   │   └── AppRoutes.jsx
│   │
│   ├── services/       # API services (Business Logic Layer)
│   │   ├── api.js      # Axios instance
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── ebookService.js
│   │   ├── affiliateService.js
│   │   └── ...
│   │
│   ├── store/          # Redux store (Data Access Layer)
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── productSlice.js
│   │       ├── cartSlice.js
│   │       ├── orderSlice.js
│   │       └── ...
│   │
│   ├── utils/          # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── themeColors.js
│   │   └── toast.js
│   │
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
│
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── netlify.toml        # Netlify deployment config
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## 🏗️ Architecture

This project follows **3-Layer Architecture**:

### 1. Presentation Layer (Components)
- **Location:** `src/components/` and `src/pages/`
- **Responsibilities:**
  - Render UI elements
  - Handle user interactions
  - Display data from store
  - Trigger service calls via actions
  - No business logic
  - No direct API calls

### 2. Business Logic Layer (Services)
- **Location:** `src/services/`
- **Responsibilities:**
  - Make API calls
  - Transform data
  - Handle business rules
  - Error handling
  - Request/Response formatting

### 3. Data Access Layer (Store/State)
- **Location:** `src/store/`
- **Responsibilities:**
  - Global state management
  - Data caching
  - State persistence
  - Action dispatching
  - Reducer logic

## 🛣️ Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product detail
- `/products/category/:id` - Products by category
- `/categories` - Categories listing
- `/search` - Search results
- `/about` - About page
- `/contact` - Contact page

### Authentication Routes
- `/login` - Login page
- `/register` - Registration page
- `/verify-otp` - OTP verification
- `/forgot-password` - Password reset

### User Routes (Protected)
- `/user/dashboard` - User dashboard
- `/user/profile` - User profile
- `/user/addresses` - Address management
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/orders/:id` - Order details
- `/ebooks` - User's eBooks
- `/ebooks/viewer` - eBook viewer
- `/affiliate` - Affiliate dashboard
- `/affiliate/commissions` - Commission history
- `/affiliate/withdraw` - Withdraw requests

### Admin Routes (Protected - Admin Only)
- `/admin/dashboard` - Admin dashboard
- `/admin/analytics` - Analytics page
- `/admin/products` - Product management
- `/admin/products/create` - Create product
- `/admin/products/:id/edit` - Edit product
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/coupons` - Coupon management
- `/admin/affiliates` - Affiliate management
- `/admin/commissions` - Commission management
- `/admin/withdraw-requests` - Withdraw requests

## 🎨 Design System

### Color Palette
- **Primary:** Indigo (#6366F1) - Trust, Professional
- **Secondary:** Purple (#8B5CF6) - Creative, Premium
- **Accent:** Pink (#EC4899) - Energy, Call-to-action
- **Success:** Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Red (#EF4444)
- **Info:** Blue (#3B82F6)

### Typography
- **Headings:** Inter or Poppins (Bold, Modern)
- **Body Text:** Inter or Roboto (Clean, Readable)

### Components Library
Built with **DaisyUI v5** - A component library for Tailwind CSS:
- Buttons, Cards, Forms
- Modals, Drawers, Badges
- Alerts, Tables, Navigation
- Stats, Charts

## 🌐 Multi-Language Support (i18n)

### Supported Languages
- **English (en)** - Default language
- **Bangla (bn)** - বাংলা

### Implementation
- i18next for translation management
- Language detection (browser/localStorage)
- Dynamic language switching
- Translation files for all content

### Usage
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('common.home')}</h1>;
}
```

## 🌓 Dark & Light Mode

### Features
- Theme context for global state
- localStorage persistence
- System preference detection
- DaisyUI theme switching
- Smooth transitions

### Usage
The theme toggle is available in the header/navbar. Users can switch between light and dark modes, and the preference is saved.

## 📦 Key Features

### 1. Product Browsing
- Grid/List view toggle
- Filter by category, price, type
- Search functionality
- Pagination
- Sort options (price, date, popularity)
- Product detail pages with image gallery

### 2. Shopping Cart
- Add/Remove items
- Quantity update
- Coupon application
- Price calculation
- Persistent cart (localStorage + backend)

### 3. Checkout Process
- Address selection/creation
- Payment method selection
- Order summary
- Coupon application
- Order confirmation

### 4. eBook Reading
- Secure PDF viewer
- Watermark display
- IP restriction handling
- Device restriction handling
- Reading progress tracking

### 5. Affiliate Program
- Referral link generation
- Commission tracking
- Withdraw request
- Performance dashboard
- Statistics and analytics

### 6. Admin Panel
- Real-time analytics
- Data tables with pagination
- Charts and graphs (Recharts)
- Bulk actions
- Export functionality
- User management
- Product management
- Order management
- Affiliate management

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📚 Technology Stack

### Core
- **React 18+** - UI library
- **React Router v6** - Routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client

### Styling
- **Tailwind CSS v3.4** - Utility-first CSS
- **DaisyUI v5** - Component library
- **Framer Motion** - Animations

### Forms
- **React Hook Form** - Form management

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React bindings
- **i18next-browser-languagedetector** - Language detection

### PDF Viewing
- **pdfjs-dist** - PDF.js library for PDF rendering

### Charts
- **Recharts** - Chart library for analytics

### Development
- **Vite** - Build tool
- **ESLint** - Linting
- **Prettier** - Code formatting

## 🚀 Deployment

### Netlify Deployment

The project is configured for Netlify deployment:

1. Push code to GitHub
2. Import project in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables:
   - `VITE_API_URL` - Your backend API URL
6. Deploy

The `netlify.toml` file is already configured with redirects.

### Environment Variables

Make sure to set `VITE_API_URL` in your deployment platform:
- Development: `http://localhost:5000/api`
- Production: `https://your-backend-api.vercel.app/api`

## 🔐 Authentication Flow

### User Registration/Login
1. User enters mobile number
2. OTP is sent via SMS
3. User enters OTP
4. JWT token is received and stored
5. User is redirected to dashboard

### Protected Routes
- Routes are protected using `ProtectedRoute` component
- Admin routes require admin role
- Guest routes redirect authenticated users

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px - Mobile landscape
- `md`: 768px - Tablet
- `lg`: 1024px - Desktop
- `xl`: 1280px - Large desktop
- `2xl`: 1536px - Extra large

### Mobile-First Approach
- Design for mobile first
- Progressive enhancement
- Touch-friendly interactions
- Responsive images

## 🎯 State Management

### Redux Store Structure
```javascript
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  products: {
    products: [],
    product: null,
    categories: []
  },
  cart: {
    items: [],
    total: 0,
    discount: 0
  },
  orders: {
    orders: [],
    order: null
  }
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Order placement
- [ ] eBook reading
- [ ] Affiliate registration
- [ ] Admin panel access
- [ ] Multi-language switching
- [ ] Dark/Light mode toggle
- [ ] Responsive design on mobile/tablet/desktop

## 📚 Documentation

Additional documentation is available:

- [Frontend Documentation](./FRONTEND_DOCUMENTATION.md) - Complete frontend documentation
- [Project Breakdown](./PROJECT_BREAKDOWN.md) - Implementation plan
- [Technology Stack](./TECHNOLOGY_STACK.md) - Technology details
- [Environment Setup](./ENV_SETUP.md) - Environment configuration
- [Netlify Deployment](./NETLIFY_DEPLOYMENT.md) - Deployment guide

## 🐛 Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` in `.env`
- Check backend server is running
- Check CORS configuration in backend
- Check network tab in browser DevTools

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version (should be v14+)

### PDF Viewer Issues
- Ensure `pdf.worker.min.mjs` is in `public/` folder
- Check browser console for errors
- Verify PDF.js version compatibility

### Theme/Language Not Persisting
- Check localStorage in browser DevTools
- Clear localStorage and try again
- Check browser settings for localStorage permissions

## 📄 License

ISC

## 👥 Contributors

- Your Name

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready

