import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import CartDrawer from './components/layout/CartDrawer.jsx';
import useAuthStore from './store/authStore.js';

const Home          = lazy(() => import('./pages/Home.jsx'));
const Products      = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Checkout      = lazy(() => import('./pages/Checkout.jsx'));
const Login         = lazy(() => import('./pages/Auth/Login.jsx'));
const Register      = lazy(() => import('./pages/Auth/Register.jsx'));
const Stores        = lazy(() => import('./pages/Stores.jsx'));
const Admin         = lazy(() => import('./pages/Admin.jsx'));
const Profile       = lazy(() => import('./pages/Profile.jsx'));
const Orders        = lazy(() => import('./pages/Orders.jsx'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-luxury-gradient">
    <div className="flex flex-col items-center gap-4">
      <img
        src="/logo.png"
        alt="Luxury Platok"
        className="h-20 w-auto object-contain animate-pulse"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback */}
      <div className="hidden w-16 h-16 rounded-full bg-pink-gradient items-center justify-center shadow-pink animate-pulse">
        <span className="text-white font-serif font-bold text-2xl">LP</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children, noFooter = false }) => (
  <>
    <Navbar />
    <CartDrawer />
    {children}
    {!noFooter && <Footer />}
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth routes (no footer) */}
          <Route path="/login"    element={<Layout noFooter><Login /></Layout>} />
          <Route path="/register" element={<Layout noFooter><Register /></Layout>} />

          {/* Main routes */}
          <Route path="/"          element={<Layout><Home /></Layout>} />
          <Route path="/products"  element={<Layout><Products /></Layout>} />
          <Route path="/products/:slug" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/stores"    element={<Layout><Stores /></Layout>} />
          <Route path="/checkout"  element={<Layout noFooter><Checkout /></Layout>} />

          {/* Protected user routes */}
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/orders"  element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />

          {/* Admin (no navbar/footer wrapper — has its own layout) */}
          <Route path="/admin" element={<Admin />} />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-luxury-gradient">
                <p className="text-7xl font-serif font-bold text-gradient-gold">404</p>
                <h2 className="font-serif text-2xl text-charcoal-700">Страница не найдена</h2>
                <a href="/" className="btn-primary mt-2">На главную</a>
              </div>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
