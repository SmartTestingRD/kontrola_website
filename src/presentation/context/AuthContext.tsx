import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    consorcioId: number;
    forcePasswordChange: boolean;
    isStaff: boolean;
}

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: UserData) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decode a JWT payload without any library (base64url → JSON).
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

/**
 * Check if a JWT token is still valid (not expired).
 */
function isTokenValid(token: string): boolean {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return false;
    // exp is in seconds, Date.now() gives ms
    return payload.exp * 1000 > Date.now();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            if (isTokenValid(storedToken)) {
                setToken(storedToken);
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    // Corrupted user data, clear everything
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                // Token expired — clean up
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: UserData) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
