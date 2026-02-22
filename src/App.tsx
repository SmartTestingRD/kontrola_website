import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { Dashboard } from './presentation/pages/Dashboard';
import { Login } from './presentation/pages/Login';
import { SorteoDetail } from './presentation/pages/SorteoDetail';
import { MainLayout } from './presentation/components/layout/MainLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin w-8 h-8 border-4 border-[#3B95B0] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Dashboard />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sorteo/:sorteo_id"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <SorteoDetail />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
