import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function request(path, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            ...options.headers,
        },
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(json.error || `Request failed (${res.status})`);
    }

    return json.data;
}

// Parents
export const getParents = () => request('/admin');

export const createParent = (data) =>
    request('/admin/parents', {
        method: 'POST',
        body: JSON.stringify(data),
    });

// Children
export const getChildren = () => request('/admin/children');

export const createChild = (parentId, data) =>
    request(`/admin/parents/${parentId}/children`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
