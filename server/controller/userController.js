import userHandler from "../handler/userHandler.js";

export const getProjectMembers = async (req, res) => {
    try {
        const { project_id } = req.params;

        if(!project_id) {
            return res.status(400).json({ message: "Please Provide a Valid Project Credentials!!!" });
        }

        const response = await userHandler.getAllProjectMembers(project_id);

        return res.status(response.status).json(response);
    } catch(err) {
        return res.status(400).json({ message: "Something Went Wrong!!!" });        
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const { project_id } = req.params;

        const response = await userHandler.getAllUsers(project_id);

        return res.status(response.status).json(response);
    } catch(err) {
        return res.status(400).json({ message: "Something Went Wrong!!!" });        
    }
}

export const addCandidateToProject = async (req, res) => {
    try {
        const { project_id } = req.params;
        const { userId: candidateId, role } = req.body;
        const { userId } = req;

        const response = await userHandler.addCandidateToProject({
            project_id,
            candidateId,
            role,
            userId
        });

        return res.status(response.status).json(response);
    } catch(err) {
        return res.status(400).json({ message: "Something Went Wrong!!!" });        
    }
}

export const removeCandidateFromProject = async (req, res) => {
    try {
        const { project_id, candidateId } = req.params;
        const { userId } = req;
        
        const response = await userHandler.removeCandidateFromProject({
            project_id,
            candidateId,
            userId
        });

        return res.status(response.status).json(response);
    } catch(err) {
        return res.status(400).json({ message: "Something Went Wrong!!!" });        
    }
}

export const updateCandidateDetails = async (req, res) => {
    const { project_id } = req.params;
    const { candidateId, role } = req.body;
    const { userId } = req;

    if(!project_id || !candidateId || !role || !userId) {
        return res.status(400).json({ message: "Invalid Credentials Provided!!!" });
    }

    const response = await userHandler.updateCandidateDetails({
        project_id,
        candidateId,
        role,
        userId
    });

    return res.status(response.status).json(response);
}