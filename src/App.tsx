import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Toaster } from './components/ui/sonner'
import { AdminLayout } from './layouts/AdminLayout'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { SessionExpiredPage } from './pages/auth/SessionExpiredPage'
import { TwoFactorPage } from './pages/auth/TwoFactorPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { UsersPage } from './pages/users/UsersPage'
import { UserDetailsPage } from './pages/users/UserDetailsPage'
import { ProductsPage } from './pages/products/ProductsPage'
import { ProductDetailsPage } from './pages/products/ProductDetailsPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { ContentPage } from './pages/content/ContentPage'
import { ContentDetailsPage } from './pages/content/ContentDetailsPage'
import { AICoachingPage } from './pages/ai-coaching/AICoachingPage'
import { AICoachingDetailsPage } from './pages/ai-coaching/AICoachingDetailsPage'
import { AICoachingEditPage } from './pages/ai-coaching/AICoachingEditPage'
import { AuthenticatingPage } from './pages/auth/AuthenticatingPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { SubscriptionsPage } from './pages/subscriptions/SubscriptionsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { CmsPage } from './pages/cms/CmsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { selectAuthHydrated, selectIsAuthenticated, useAuthStore } from './store/authStore'

function NotFoundPage() {
  return <div className="grid min-h-screen place-items-center bg-black text-white">Page not found.</div>
}

function RootRedirect() {
  const hasHydrated = useAuthStore(selectAuthHydrated)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  if (!hasHydrated) {
    return null
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/2fa" element={<TwoFactorPage />} />
        <Route path="/authenticating" element={<AuthenticatingPage />} />
        <Route path="/session-expired" element={<SessionExpiredPage />} />
        <Route path="/about-us" element={<CmsPage pageId="about-us" />} />
        <Route path="/privacy-policy" element={<CmsPage pageId="privacy-policy" />} />
        <Route path="/terms-and-conditions" element={<CmsPage pageId="terms-and-conditions" />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserDetailsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/content/:contentId" element={<ContentDetailsPage />} />
            <Route path="/ai-coaching" element={<AICoachingPage />} />
            <Route path="/ai-coaching/:contentId/edit" element={<AICoachingEditPage />} />
            <Route path="/ai-coaching/:contentId" element={<AICoachingDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
