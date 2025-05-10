import project from "../database/project.js"
import project_user from "../database/project_user.js";
import task from "../database/task.js";

const getAllTasks = async (projectId, searchTerm) => {
    try {
        if(!projectId) {
            return {
                status: 400,
                message: "Project Id is required!!"
            }
        }

        const projectDetails = await project.GetProjectFromId(projectId);

        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Not Found!!"
            }
        }

        const taskList = await task.getAllTasks(projectId, searchTerm);

        return {
            status: 200,
            message: "Success",
            data: taskList
        }
    } catch (err) {
        return {
            status: 400,
            message: "Error While Fetching Data!!"
        }
    }
}

const addTask = async ({ projectId, title, assignedTo, status, userId, dueDate, priority, description }) => {
    try {
        const projectDetails = await project.GetProjectFromId(projectId);

        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Not Found!!"
            }
        }

        if(!userId) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, projectId);

        if(!userRole || (userRole.role !== "admin" && userRole.role !== "manager")) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        const taskData = {
            title,
            assignedTo,
            status,
            project_id: projectId,
            due_date: dueDate,
            priority: priority ? priority.toUpperCase() : "LOW",
            description
        }

        const savedTask = await task.CreateNewTask(taskData);

        return {
            status: 201,
            message: "Success",
            data: {
                id: savedTask
            }
        }
    } catch(err) {
        return {
            status: 400,
            message: "Error While Saving Data!!"
        }
    }
}

const deleteTask = async ({ projectId, taskId, userId }) => {
    try {
        const projectDetails = await project.GetProjectFromId(projectId);

        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Not Found!!"
            }
        }

        if(!userId) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, projectId);
        if(!userRole || (userRole.role !== "admin" && userRole.role !== "manager")) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        await task.deleteTask(taskId);

        return {
            status: 200,
            message: "Success"
        }
    } catch (err) {
        return {
            status: 400,
            message: "Error While Saving Data!!"
        }
    }
}

const updateTask = async ({ projectId, taskId, userId, taskDetails = {} }) => {
    try {
        const projectDetails = await project.GetProjectFromId(projectId);

        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Not Found!!"
            }
        }

        if(!userId) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, projectId);

        if(!userRole || (userRole.role !== "admin" && userRole.role !== "manager")) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        await task.updateTask(projectId, taskId, taskDetails);

        return {
            status: 200,
            message: "Success"
        }
    } catch(err) {
        return {
            status: 400,
            message: "Error While Saving Data!!"
        }
    }
}

const getAllComments = async ({ projectId, taskId }) => {
    try {
        const projectDetails = await project.GetProjectFromId(projectId);

        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Not Found!!"
            }
        }

        const comments = await task.getAllComments(taskId, projectId);

        return {
            status: 200,
            message: "Success",
            data: comments
        }
    } catch(err) {
        return {
            status: 400,
            message: "Error While Saving Data!!"
        }        
    }
}

const addComment = async ({ projectId, taskId, userId, comment }) => {
    try {
        const projectDetails = await project.GetProjectFromId(projectId);

        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Not Found!!"
            }
        }

        if(!userId) {
            return {
                status: 401,
                message: "Unauthorized User!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, projectId);
        if(!userRole) {
            return {
                status: 403,
                message: "Unauthorized User!!"
            }
        }

        const response = await task.addComment({ taskId, userId, comment });

        return {
            status: 201,
            message: "Success",
            data: response.id
        }
    } catch(err) {
        console.log(err.message);
        return {
            status: 400,
            message: "Error While Saving Data!!"
        }        
    }
}

export default {
    getAllTasks,
    addTask,
    deleteTask,
    updateTask,
    getAllComments, 
    addComment
}