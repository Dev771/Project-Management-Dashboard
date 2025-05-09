import { runQuery } from "../config/connection.js";

const getAllProjectUsers = async (project_id) => {
    const data = await runQuery(`
        Select
            u.id,
            u.name,
            u.email,
            pu.role
        FROM 
            project_users pu
        LEFT JOIN
            users u ON u.id = pu.user_id
        WHERE 
            pu.project_id = ?
    `, [project_id]);

    return data;
}

const getUserDetails = async (userId, projectId) => {
    const data = await runQuery(`
        Select
            u.name,
            u.email,
            pu.role
        FROM 
            project_users pu
        LEFT JOIN
            users u ON u.id = pu.user_id
        WHERE 
            pu.user_id = ? AND pu.project_id = ? AND u.status = 'ACTIVE'
    `, [userId, projectId]);

    return data[0];
}

const addCandidateToProject = async ({ project_id, candidateId, role }) => {
    try {
        await runQuery(`
            Insert into project_users (project_id, user_id, role) values (?, ?, ?)
        `, [project_id, candidateId, role]);

        return {
            status: 200,
            message: "Success"
        }
    } catch(err) {
        return {
            status: 400,
            message: err.message
        }
    }
}

const removeCandidateFromProject = async ({
    candidateId,
    project_id
}) => {
    try {
        await runQuery(`
            Delete from project_users where project_id = ? and user_id = ?
        `, [project_id, candidateId]);

        return {
            status: 200,
            message: "Success"
        }
    } catch(err) {
        return {
            status: 400,
            message: err.message
        }
    }
}

const updateCandidateRole = async ({ project_id, candidateId, role }) => {
    try {
        await runQuery(`
            Update project_users set role = ? where project_id = ? and user_id = ?
        `, [role, project_id, candidateId]);

        return {
            status: 200,
            message: "Success"
        }
    } catch(err) {
        return {
            status: 400,
            message: err.message
        }
    }
}

const deleteAllUserLinks = async (projectId) => {
    await runQuery(`
        DELETE FROM project_users where project_id = ?
    `, [projectId]);

    return {
        status: 200,
        message: "All Members From the Project Removed!!!"
    }
}

export default {
    getAllProjectUsers,
    getUserDetails,
    addCandidateToProject,
    removeCandidateFromProject,
    updateCandidateRole,
    deleteAllUserLinks
}