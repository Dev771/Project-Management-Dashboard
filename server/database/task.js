import { runQuery } from "../config/connection.js"

const getAllTasks = async (projectId, searchTerm = "") => {
    let query = `
        SELECT
            t.id,
            t.title,
            t.status,
            t.priority,
            t.description,
            u.id AS assigned_to,
            u.name AS assigned_to_name,
            u.email AS assigned_to_email,
            t.due_date
        FROM tasks t
        LEFT JOIN users u ON u.id = t.assigned_to
        WHERE t.project_id = ?
    `;

    const values = [projectId];

    if (searchTerm.trim()) {
        query += `
            AND (
                LOWER(t.title) LIKE ?
                OR LOWER(u.name) LIKE ?
                OR LOWER(u.email) LIKE ?
                OR t.status = ?
                OR t.priority = ?
            )
        `;
        const likeValue = `%${searchTerm.toLowerCase()}%`;
        values.push(likeValue, likeValue, likeValue, searchTerm, searchTerm);
    }

    const data = await runQuery(query, values);
    return data;
};

const CreateNewTask = async (taskDetails) => {
    const data = await runQuery("Insert into tasks (title, assigned_to, status, project_id, due_date, priority, description) values (?, ?, ?, ?, ?, ?, ?)", [
        taskDetails.title,
        taskDetails.assignedTo,
        taskDetails.status,
        taskDetails.project_id,
        taskDetails.due_date,
        taskDetails.priority,
        taskDetails.description
    ]);

    return data.insertId;
}

const deleteTask = async (taskId) => {
    const data = await runQuery("Delete from tasks where id = ?", [taskId]);
    return data;
}

const updateTask = async (projectId, taskId, updateData) => {
    const fields = [];
    const values = [];

    if (updateData.title !== undefined) {
        fields.push(`title = ?`);
        values.push(updateData.title);
    }
    if (updateData.assignedTo !== undefined) {
        fields.push(`assigned_to = ?`);
        values.push(updateData.assignedTo);
    }
    if (updateData.status !== undefined) {
        fields.push(`status = ?`);
        values.push(updateData.status);
    }
    if (updateData.dueDate !== undefined) {
        fields.push(`due_date = ?`);
        values.push(updateData.dueDate);
    }

    if (updateData.description !== undefined) {
        fields.push(`description = ?`);
        values.push(updateData.description);
    }

    if (updateData.priority !== undefined) {
        fields.push(`priority = ?`);
        values.push(updateData.priority.toUpperCase());
    }

    if (fields.length === 0) {
        return { success: false, message: 'No fields to update' };
    }

    const query = `
        UPDATE tasks
        SET ${fields.join(', ')}
        WHERE id = ? AND project_id = ?;
    `;

    values.push(taskId, projectId);

    try {
        const result = await runQuery(query, values);
        return {
            success: true,
            data: result[0]
        };
    } catch (error) {
        console.error('Error updating task:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getAllComments = async (taskId, projectId) => {
    const data = await runQuery(`
        Select 
            tc.comment,
            tc.id,
            tc.created_at,
            u.name,
            u.email,
            u.id as userId
        FROM 
            task_comments tc
        LEFT JOIN
            users u ON u.id = tc.user_id
        WHERE 
            tc.task_id = ?
    `, [taskId]);

    return data;
}

const addComment = async ({ taskId, userId, comment }) => {
    const data = await runQuery(`
        Insert into task_comments (task_id, user_id, comment) values (?, ?, ?)
    `, [taskId, userId, comment]);

    return {
        id: data.insertId
    };
}

const getTaskDetails = async (projectId, taskId) => {
    const data = await runQuery(`
        Select
            t.id as id,
            t.title as title,
            t.status as status,
            t.priority as priority,
            t.description,
            u.id as assigned_to,
            u.name as assigned_to_name,
            u.email as assigned_to_email,
            t.due_date as due_date
        FROM 
            tasks t
        LEFT JOIN
            users u ON u.id = t.assigned_to
        WHERE 
            t.project_id = ? and t.id = ?
    `, [projectId, taskId]);

    return data.length ? data[0] : null;
}

const deleteAllTask = async (taskIds) => {
    await runQuery(`
        DELETE FROM task_comments WHERE task_id IN (?)
    `, [taskIds])

    await runQuery(`
        DELETE FROM task WHERE id IN (?)
    `, [taskIds]);

    return {
        status: 200,
        message: "All Tasks Deleted!!!"
    }
}

export default {
    getAllTasks,
    CreateNewTask,
    deleteTask,
    updateTask,
    getAllComments,
    addComment,
    getTaskDetails,
    deleteAllTask
}