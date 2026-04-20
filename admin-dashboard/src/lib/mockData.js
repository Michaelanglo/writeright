export const mockParents = [
    {
        id: "p_1",
        parent_first_name: "Sarah",
        parent_last_name: "Johnson",
        email: "sarah.j@example.com",
        created_at: "2023-11-15T10:00:00Z",
        children_list: [
            {
                id: "c_1",
                child_name: "Emma",
                age: 6,
                game_progress: [{ current_level: 4, total_xp: 1250, total_stars: 45 }]
            },
            {
                id: "c_2",
                child_name: "Leo",
                age: 4,
                game_progress: [{ current_level: 1, total_xp: 120, total_stars: 3 }]
            }
        ]
    },
    {
        id: "p_2",
        parent_first_name: "Michael",
        parent_last_name: "Chen",
        email: "mchen88@example.com",
        created_at: "2024-01-22T14:30:00Z",
        children_list: [
            {
                id: "c_3",
                child_name: "Mia",
                age: 7,
                game_progress: [{ current_level: 8, total_xp: 3400, total_stars: 112 }]
            }
        ]
    },
    {
        id: "p_3",
        parent_first_name: "Jessica",
        parent_last_name: "Davis",
        email: "jdavis.design@example.com",
        created_at: "2024-02-05T09:15:00Z",
        children_list: [
            {
                id: "c_4",
                child_name: "Noah",
                age: 5,
                game_progress: [{ current_level: 3, total_xp: 850, total_stars: 28 }]
            },
            {
                id: "c_5",
                child_name: "Ava",
                age: 8,
                game_progress: [{ current_level: 12, total_xp: 5600, total_stars: 185 }]
            }
        ]
    },
    {
        id: "p_4",
        parent_first_name: "David",
        parent_last_name: "Wilson",
        email: "dwilson_tech@example.com",
        created_at: "2024-02-28T16:45:00Z",
        children_list: [
            {
                id: "c_6",
                child_name: "Oliver",
                age: 5,
                game_progress: [{ current_level: 2, total_xp: 450, total_stars: 15 }]
            }
        ]
    },
    {
        id: "p_5",
        parent_first_name: "Elena",
        parent_last_name: "Rodriguez",
        email: "elena.r@example.com",
        created_at: "2024-03-01T11:20:00Z",
        children_list: []
    }
];

export const mockChildren = mockParents.flatMap(parent =>
    parent.children_list.map(child => ({
        ...child,
        accounts: {
            parent_first_name: parent.parent_first_name,
            parent_last_name: parent.parent_last_name
        }
    }))
);

export const mockSessions = [
    ...Array(120).fill().map((_, i) => ({
        score: Math.floor(Math.random() * 40) + 60, // Scores between 60 and 100
        session_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        character_type: Math.random() > 0.3 ? 'letter' : 'number',
        character_value: String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Random letter A-Z
    }))
];

export const mockMastery = [
    ...Array(30).fill('beginner'),
    ...Array(45).fill('intermediate'),
    ...Array(20).fill('advanced'),
    ...Array(15).fill('master')
];
