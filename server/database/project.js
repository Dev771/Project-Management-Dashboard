import { runQuery } from "../config/connection.js";

const CreateNewProject = async (project) => {
    const { name, description, userId } = project;
    const inserted = await runQuery("INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)", [name, description, userId]);
    const projectId = inserted.insertId;
    await runQuery("INSERT INTO project_users (project_id, user_id, role) VALUES (?, ?, 'admin')", [projectId, userId]);

    const savedProject = await runQuery("SELECT * FROM projects WHERE id = ?", [projectId]);
    return savedProject.length ? savedProject[0] :  null;
}

const GetAllUserProjects = async ({
    userId,
    page = 1,
    pageSize = 5,
    isAdmin = true,
    search = "",
    sortBy = "p.created_at",
    sortDirection = "DESC"
}) => {
    let query = `
        SELECT 
            p.name AS name, 
            p.description AS description, 
            u.name AS owner_name, 
            u.email AS owner_email, 
            pu.role, 
            p.created_at,
            p.id AS project_id
        FROM 
            project_users pu
        LEFT JOIN 
            projects p ON pu.project_id = p.id
        LEFT JOIN 
            users u ON p.created_by = u.id
        WHERE 
            pu.user_id = ?`;

    let queryCount = `
        Select 
            Count(*) as total
        FROM 
            projects p
        LEFT JOIN 
            project_users pu ON p.id = pu.project_id
        WHERE 
            pu.user_id = ?
    `

    const queryParams = [userId];
    const queryCountParams = [userId];

    if (isAdmin) {
        query += " AND pu.role = ?";
        queryCount += " AND pu.role = ?";
    } else {
        query += " AND pu.role != ?";
        queryCount += " AND pu.role != ?";
    }
    queryParams.push("admin");
    queryCountParams.push("admin");

    if (search.trim()) {
        query += " AND (p.name LIKE ? OR p.description LIKE ?)";
        queryCount += " AND (p.name LIKE ? OR p.description LIKE ?)";
        const searchTerm = `%${search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
        queryCountParams.push(searchTerm, searchTerm);
    }

    const allowedSortColumns = ["p.name", "p.description", "u.name", "u.email", "pu.role", "p.created_at"];
    const sanitizedSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "p.created_at";
    const sanitizedSortDirection = sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${sanitizedSortBy} ${sanitizedSortDirection}`;

    const offset = (page - 1) * pageSize;
    query += " LIMIT ? OFFSET ?";
    queryParams.push(parseInt(pageSize), parseInt(offset));

    try {
        const rows = await runQuery(query, queryParams);
        const count = await runQuery(queryCount, queryCountParams);
        return {
            data: rows,
            totalCount: count[0].total
        };
    } catch (error) {
        console.error("Error fetching user projects:", error);
        throw new Error("Database query failed");
    }
};

const GetProjectFromId = async (projectId) => {
    const data = await runQuery("Select * from projects where id = ?", [projectId]);

    return data.length ? data[0] : null;
}

const GetProjectDetailsBasedOnUserAndProjectId = async ({ project_id, user_id }) => {
    const data = await runQuery(`
        Select
            p.id as project_id,
            p.name as project_name,
            p.description as project_description,
            pu.role as userRole
        FROM 
            project_users pu
        LEFT JOIN 
            projects p ON
                pu.project_id = p.id
        WHERE 
            pu.user_id = ? AND pu.project_id = ?;
    `, [user_id, project_id]);

    return data.length ? data[0] : null;
}

const deleteProject = async (projectId) => {
    await runQuery(`
        DELETE FROM projects where id = ?
    `, [projectId]);

    return {
        status: 200,
        message: "Project Deleted Successfully!!!"
    }
}

const updateProject = async ({ project_id, name, description }) => {
    await runQuery(`
        UPDATE projects
            SET name = ?, description = ?
        WHERE id = ?
    `, [name, description, project_id]);

    return {
        message: "success"
    }
}

export default {
    CreateNewProject,
    GetAllUserProjects,
    GetProjectFromId,
    GetProjectDetailsBasedOnUserAndProjectId,
    deleteProject,
    updateProject
}