import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get all parents with their children and game progress
 * GET /api/v1/admin
 */
export const getAllParents = async (req, res, next) => {
    try {
        if (!supabaseAdmin) {
            return res.status(500).json({
                success: false,
                error: 'Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY.'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('accounts')
            .select('*, children_list:children(*, game_progress(total_xp, current_level, total_stars))')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new parent (auth user + account row)
 * POST /api/v1/admin/parents
 */
export const createParent = async (req, res, next) => {
    try {
        if (!supabaseAdmin) {
            return res.status(500).json({
                success: false,
                error: 'Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY.'
            });
        }

        const { parent_first_name, parent_last_name, email, password } = req.body;

        if (!parent_first_name || !parent_last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: parent_first_name, parent_last_name, email, password'
            });
        }

        // 1. Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) throw authError;

        // 2. Insert account row
        const { data, error: insertError } = await supabaseAdmin
            .from('accounts')
            .insert({
                id: authData.user.id,
                email,
                parent_first_name,
                parent_last_name,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all children with parent info and game progress
 * GET /api/v1/admin/children
 */
export const getAllChildren = async (req, res, next) => {
    try {
        if (!supabaseAdmin) {
            return res.status(500).json({
                success: false,
                error: 'Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY.'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('children')
            .select(`
                *,
                accounts(parent_first_name, parent_last_name, email),
                game_progress(total_xp, current_level, total_stars)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a child for a specific parent
 * POST /api/v1/admin/parents/:parentId/children
 */
export const createChild = async (req, res, next) => {
    try {
        if (!supabaseAdmin) {
            return res.status(500).json({
                success: false,
                error: 'Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY.'
            });
        }

        const { parentId } = req.params;
        const { child_name, age } = req.body;

        if (!child_name) {
            return res.status(400).json({
                success: false,
                error: 'child_name is required'
            });
        }

        if (age !== undefined && age !== null && age !== '') {
            const ageNum = Number(age);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
                return res.status(400).json({
                    success: false,
                    error: 'Age must be between 1 and 18'
                });
            }
        }

        const { data, error } = await supabaseAdmin
            .from('children')
            .insert({
                account_id: parentId,
                child_name,
                age: age ? parseInt(age) : null,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
