import taskHandler from "../handler/taskHandler.js";

export const getAllTasks = async (req, res) => {
    const { projectId } = req.params;
    const { searchTerm } = req.query;

    if(!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    const response = await taskHandler.getAllTasks(projectId, searchTerm);

    res.status(response.status).json(response);
}

export const addTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, assignedTo, status, dueDate, priority } = req.body;
    const { userId } = req;

    if(!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    const response = await taskHandler.addTask({ projectId, title, assignedTo, status, userId, dueDate, priority });
    
    res.status(response.status).json(response);
}

export const deleteTask = async (req, res) => {
    const { taskId, projectId } = req.params;
    const { userId } = req;

    if(!projectId || !taskId) {
        return res.status(400).json({ error: 'Project ID and Task ID are required' });
    }

    const response = await taskHandler.deleteTask({ taskId, projectId, userId });

    res.status(response.status).json(response);
}

export const updateTask = async (req, res) => {
    const { taskId, projectId } = req.params;
    const { userId } = req;

    const { title, assignedTo, status, dueDate, priority } = req.body;

    if(!projectId || !taskId) {
        return res.status(400).json({ error: 'Project ID and Task ID are required' });
    }

    const response = await taskHandler.updateTask({ taskId, projectId, userId, taskDetails: {
        title,
        assignedTo,
        status,
        dueDate, 
        priority
    } });

    res.status(response.status).json(response);
}

export const getAllComments = async (req, res) => {
    const { projectId, taskId } = req.params;

    if(!projectId || !taskId) {
        return res.status(400).json({
            message: "Invalid Credentials Provided"
        });
    }

    const response = await taskHandler.getAllComments({ projectId, taskId });

    res.status(response.status).json(response);
}

export const addComment = async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req;
    const { taskId, comment } = req.body;

    if(!projectId || !taskId || !comment) {
        return res.status(400).json({
            message: "Invalid Credentials Provided"
        });
    }

    const response = await taskHandler.addComment({ projectId, taskId, userId, comment });

    res.status(response.status).json(response);
}