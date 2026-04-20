import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Inject a mock user so the dashboard unlocks immediately for the demo
    const [user, setUser] = useState({ id: 'demo_admin', email: 'admin@writeright.com' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mock loading delay to feel authentic
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const signIn = async (email, password) => {
        // Mock successful sign in
        setUser({ id: 'demo_admin', email });
        return { data: { user: { id: 'demo_admin', email } }, error: null };
    };

    const signOut = async () => {
        // Mock sign out
        setUser(null);
        return { error: null };
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
