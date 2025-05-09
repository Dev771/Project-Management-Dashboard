import projectHandler from "../handler/projectHandler.js";

export const AddNewProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { userId } = req;

        const response = await projectHandler.AddNewProject({
            name,
            description,
            userId
        });

        return res.status(response.status).json(response);
    } catch (err) {
        return res.status(400).json({ message: "Error While Saving the Data!!!" });
    }
}

export const getAllProjects = async (req, res) => {
    try {
        const { page = 1, pageSize = 5, roleGroup = "admin", search, sortBy, sortDirection } = req.query;
        const { userId } = req;

        const response = await projectHandler.getAllProjects({
            userId,
            page,
            pageSize,
            isAdmin: roleGroup === "admin",
            search,
            sortBy,
            sortDirection
        });

        return res.status(response.status).json(response);
    } catch (err) {
        return res.status(400).json({ message: "Error While Fetching the Data!!!" });
    }
}

export const getProjectDetails = async (req, res) => {
    try {
        const { project_id } = req.params;
        const { userId } = req;
        
        if(!project_id) {
            return {
                status: 400,
                message: "Invalid Project Credentials Provided!!!"
            }
        }

        const response = await projectHandler.getProjectDetails(project_id, userId);

        return res.status(response.status).json(response);
    } catch (err) {
        return res.status(400).json({ message: "Error While Fetching the Data!!!" });
    }
}

export const deleteProject = async (req, res) => {
    const { userId } = req;
    const { project_id } = req.params;

    if(!project_id || !userId) {
        return res.status(400).json("Invalid Credentials Provided!!!");
    }

    const response = await projectHandler.deleteProject(project_id, userId);

    return res.status(response.status).json(response);
}

export const updateProject = async (req, res) => {
    const { project_id } = req.params;
    const { name, description } = req.body;
    const { userId } = req;

    if(!project_id || !userId) {
        return res.status().json({
            status: 400,
            message: "Invalid Credentials!!"
        });
    }

    const response = await projectHandler.updateProject({
        project_id,
        name,
        description,
        userId
    })

    return res.status(response.status).json(response);
}