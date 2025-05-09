import projects from "../database/project.js"
import { db } from "../config/connection.js";
import users from "../database/users.js";
import project_user from "../database/project_user.js";
import task from "../database/task.js";
import project from "../database/project.js";

const AddNewProject = async (project) => {
    try {
        const savedProject = await projects.CreateNewProject(project);

        if(!savedProject) {
            throw new Error("Error While Saving the Data!!!")
        }

        return {
            status: 200,
            data: savedProject
        }
    } catch(err) {
        return {
            status: 400,
            message: err.message || "Error While Saving the Data!!!"
        }
    }
}

const getAllProjects = async ({
    userId,
    page = 1,
    pageSize = 5,
    isAdmin = true,
    search,
    sortBy,
    sortDirection
}) => {
    try {
        const data  = await projects.GetAllUserProjects({
            userId,
            page,
            pageSize,
            isAdmin,
            search,
            sortBy,
            sortDirection
        });
        
        return {
            status: 200,
            data
        };
    } catch(err) {
        return {
            status: 400,
            message: "Error While Fetching the Data!!!"
        }
    }
}

const getProjectDetails = async (project_id, user_id) => {
    try {
        const project = await projects.GetProjectDetailsBasedOnUserAndProjectId({
            project_id,
            user_id
        });

        return {
            status: 200,
            data: project
        };
    } catch(err) {
        return {
            status: 400,
            message: "Error While Fetching the Data!!!"
        }
    }
} 

const deleteProject = async (project_id, user_id) => {
    const projectDetails = await projects.GetProjectFromId(project_id);

    if(!projectDetails) {
        return {
            status: 404,
            message: "Project Details Not Found!!"
        }
    }

    const userRole = await project_user.getUserDetails(user_id, project_id);
    if(!userRole || userRole.role !== 'admin') {
        return {
            status: 403,
            message: "UnAuthenticated"
        }
    }
    db.beginTransaction();
    try {
        const taskList = await task.getAllTasks(project_id);
        const taskIdList = taskList.map((a) => a.id);

        if(taskIdList.length > 0) {
            await task.deleteAllTask(taskIdList);
        }

        await project_user.deleteAllUserLinks(project_id);

        await project.deleteProject(project_id);

        db.commit();

        return {
            status: 200,
            message: "Project Deleted Successfully!!"
        }
    } catch(err) {
        db.rollback();
        console.log(err);
        return {
            status: 400,
            message: err.message || "Error While Deleting the Project"
        }
    }
}

const updateProject = async ({ project_id, name, description, userId }) => {
    try{
        const projectDetails = await project.GetProjectFromId(project_id);
        if(!projectDetails) {
            return {
                status: 404,
                message: "Project Doesn't Exists!!"
            }
        }

        const userRole = await project_user.getUserDetails(userId, project_id);
        if(!userRole || userRole.role !== "admin") {
            return {
                status: 403,
                message: "Unauthorized Access!!"
            }
        }

        await project.updateProject({
            project_id,
            name,
            description
        });

        return {
            status: 200,
            messsage: "Project Updated Successfullty!!"
        }
    } catch(err) {
        return {
            status: 400,
            message: "Error While Updating the Details!!"
        }
    }

}

export default {
    AddNewProject,
    getAllProjects,
    getProjectDetails,
    deleteProject,
    updateProject
}