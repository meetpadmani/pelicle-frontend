import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';
import { fetchWishlist } from './features/wishlist/wishlistSlice';
import Layout from './components/layout/Layout';
import AdminLayout from './admin/components/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// ─── Lazy Pages ───────────────────────────────────────────────────────────────
const HomePage        = lazy(() => import('./pages/HomePage'));
const ProductsPage    = lazy(() => import('./pages/ProductsPage'));
const ProductDetail   = lazy(() => import('./pages/ProductDetailPage'));
const CartPage        = lazy(() => import('./pages/CartPage'));
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPassword   = lazy(() => import('./pages/ResetPasswordPage'));
const SearchPage      = lazy(() => import('./pages/SearchPage'));
const OrderConfirm    = lazy(() => import('./pages/OrderConfirmPage'));
const TrackOrderPage  = lazy(() => import('./pages/TrackOrderPage'));
const NotFound        = lazy(() => import('./pages/NotFoundPage'));
const AboutPage       = lazy(() => import('./pages/AboutPage'));
const PageView        = lazy(() => import('./pages/PageView'));

// Dashboard pages
const DashboardHome   = lazy(() => import('./pages/dashboard/DashboardHome'));
const MyOrders        = lazy(() => import('./pages/dashboard/MyOrders'));
const OrderDetail     = lazy(() => import('./pages/dashboard/OrderDetail'));
const MyWishlist      = lazy(() => import('./pages/dashboard/MyWishlist'));
const MyAddresses     = lazy(() => import('./pages/dashboard/MyAddresses'));
const ProfileEdit     = lazy(() => import('./pages/dashboard/ProfileEdit'));

// Admin pages
const AdminDashboard  = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProducts   = lazy(() => import('./admin/pages/AdminProducts'));
const AdminOrders     = lazy(() => import('./admin/pages/AdminOrders'));
const AdminUsers      = lazy(() => import('./admin/pages/AdminUsers'));
const AdminCategories = lazy(() => import('./admin/pages/AdminCategories'));
const AdminCoupons    = lazy(() => import('./admin/pages/AdminCoupons'));
const AdminBanners    = lazy(() => import('./admin/pages/AdminBanners'));
const AdminReviews    = lazy(() => import('./admin/pages/AdminReviews'));
const AdminLayoutEditor = lazy(() => import('./admin/pages/AdminLayoutEditor'));
const AdminHomepageBuilder = lazy(() => import('./admin/pages/AdminHomepageBuilder'));
const AdminLoginPage       = lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminProductNew      = lazy(() => import('./admin/pages/AdminProductNew'));
const AdminProductEdit     = lazy(() => import('./admin/pages/AdminProductEdit'));
const AdminIntegrations    = lazy(() => import('./admin/pages/AdminIntegrations'));
const AdminAnnouncement    = lazy(() => import('./admin/pages/AdminAnnouncement'));
const AdminNotificationRules = lazy(() => import('./admin/pages/AdminNotificationRules'));
const SiteSettings         = lazy(() => import('./admin/pages/SiteSettings'));
const SeoSettings          = lazy(() => import('./admin/pages/SeoSettings'));
const DataBackup           = lazy(() => import('./admin/pages/DataBackup'));
const AdminShiprocket      = lazy(() => import('./admin/pages/ShiprocketPage'));
const AdminShippingRules   = lazy(() => import('./admin/pages/ShippingRules'));
const AdminPopupSettings   = lazy(() => import('./admin/pages/PopupSettings'));
const AdminPages           = lazy(() => import('./admin/pages/AdminPages'));

// ─── Protected Route Components ───────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchCurrentUser());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pages/:slug" element={<PageView />} />

          {/* Guest-only */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

          {/* Protected user routes */}
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirm/:id" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/dashboard/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/dashboard/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/dashboard/wishlist" element={<ProtectedRoute><MyWishlist /></ProtectedRoute>} />
          <Route path="/dashboard/addresses" element={<ProtectedRoute><MyAddresses /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        </Route>

        {/* ─── Admin Routes ─── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductNew />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="layout" element={<AdminLayoutEditor />} />
          <Route path="home-builder" element={<AdminHomepageBuilder />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="announcement" element={<AdminAnnouncement />} />
          <Route path="notification-rules" element={<AdminNotificationRules />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="seo-settings" element={<SeoSettings />} />
          <Route path="data-backup" element={<DataBackup />} />
          <Route path="shiprocket" element={<AdminShiprocket />} />
          <Route path="shipping-rules" element={<AdminShippingRules />} />
          <Route path="popup-settings" element={<AdminPopupSettings />} />
          <Route path="pages" element={<AdminPages />} />
        </Route>
        
        {/* Dedicated Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
