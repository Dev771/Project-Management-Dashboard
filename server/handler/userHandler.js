import project from "../database/project.js"
import project_user from "../database/project_user.js";
import users from "../database/users.js";

const getAllProjectMembers = async (projectId) => {
    try {
        if(!projectId) {
            return {
                status: 400,
                message: "Project ID is required"
            }
        }
    
        const projectDetails = await project.GetProjectFromId(projectId);
    
        if(!projectDetails) {
            return {
                status: 404,
                message: "Project not found"
            }
        }
    
        const membersDetails = await project_user.getAllProjectUsers(projectId);
    
        return {
            status: 200,
            data: membersDetails
        }
    } catch (error) {
        return {
            status: 400,
            message: error.message
        }
    }
}

const getAllUsers = async (projectId) => {
    try {
        const userList = await users.getAllUsersNotInProject(projectId);

        return {
            status: 200,
            data: userList
        }
    } catch (error) {
        return {
            status: 400,
            message: error.message
        }
    }
}

const addCandidateToProject = async ({ project_id, candidateId, role, userId }) => {
    try {
        if(!project_id || !candidateId || !role || !userId) {
            return {
                status: 400,
                message: "Invalid Credentials Provided!!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, project_id);
        if(!userRole || userRole.role !== "admin") {
            return {
                status: 401,
                message: "Unauthorized User!!!"
            }
        }

        await project_user.addCandidateToProject({
            project_id,
            candidateId,
            role
        });

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

const removeCandidateFromProject = async ({  project_id, candidateId, userId }) => {
    try {
        if(!project_id || !candidateId || !userId) {
            return {
                status: 400,
                message: "Invalid Credentials Provided!!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, project_id);
        if(!userRole || userRole.role !== "admin") {
            return {
                status: 403,
                message: "Unauthorized User!!!"
            }
        }

        await project_user.removeCandidateFromProject({
            project_id,
            candidateId
        });

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

const updateCandidateDetails = async ({ project_id, candidateId, role, userId }) => {
    try {
        if(!project_id || !candidateId || !role || !userId) {
            return {
                status: 400,
                message: "Invalid Credentials Provided!!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, project_id);
        if(!userRole || userRole.role !== "admin") {
            return {
                status: 403,
                message: "Unauthorized User!!!"
            }
        }

        await project_user.updateCandidateRole({
            project_id,
            candidateId,
            role
        });

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

export default {
    getAllProjectMembers,
    getAllUsers,
    addCandidateToProject,
    removeCandidateFromProject,
    updateCandidateDetails
}