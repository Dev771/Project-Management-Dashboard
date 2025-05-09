import projects from "../database/project.js"

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

export default {
    AddNewProject,
    getAllProjects,
    getProjectDetails
}