import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StoreNotificationProvider } from './context/StoreNotificationContext'
import MobileShell from './components/MobileShell'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MenuManagementPage from './pages/MenuManagementPage'
import TablesPage from './pages/TablesPage'
import OrdersPage from './pages/OrdersPage'
import SettingsPage from './pages/SettingsPage'
import EmployeesPage from './pages/EmployeesPage'
import StatsPage from './pages/StatsPage'
import CustomerMenuPage from './pages/CustomerMenuPage'

export default function App() {
  return (
    <AuthProvider>
      <StoreNotificationProvider>
        <MobileShell>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu/:storeId/:tableId" element={<CustomerMenuPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/menu-management" element={<MenuManagementPage />} />
              <Route path="/menu" element={<Navigate to="/menu-management" replace />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MobileShell>
      </StoreNotificationProvider>
    </AuthProvider>
  )
}
