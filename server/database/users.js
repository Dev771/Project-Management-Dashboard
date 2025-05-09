import { runQuery } from "../config/connection.js"

const validateUserEmailAndPassword = async (email, password) => {
    const data = await runQuery("Select email, name, id, created_at from users where email = ? and password = ? and status = 'ACTIVE'", [email, password]);

    if(!data.length) {
        throw new Error("Invalid Email Id or Password!!!");
        return;
    }

    return data[0];
}

const checkIfEmailExists = async (email) => {
    const data = await runQuery("Select email from users where email = ? and status = 'ACTIVE'", [email]);

    return data.length ? true : false;
}

const createUser = async (email, name, password) => {
    try {
        const result = await runQuery("Insert into users (email, name, password, status) values (?, ?, ?, 'ACTIVE')", [email, name, password]);
        const insertedId = result.insertId;

        const data = await runQuery(
          "SELECT email, name, id, created_at FROM users WHERE id = ?",
          [insertedId]
        );
    
        return data[0];
    } catch(err) {
        return {
            message: "Something went wrong!!!"
        }
    }
}

const getUserDetails = async (userId) => {
    try {
        const result = await runQuery("Select id, email, name, created_at from users where id = ? and status = 'ACTIVE'", [userId]);

        return result[0];
    } catch(err) {
        return {
            message: "Something went Wrong!!!"
        }
    }
}

const getUserFromEmailId = async (email) => {
    const result = await runQuery("Select id, email, name, created_at, password from users where email = ? and status = 'ACTIVE'", [email]);

    return result[0];
}

const getAllUsersNotInProject = async (projectId) => {
    const result = await runQuery(`
        SELECT 
            u.id,
            u.name,
            u.email
        FROM 
            users u
        WHERE 
            u.status = 'ACTIVE'
            AND u.id NOT IN (
                SELECT pu.user_id
                FROM project_users pu
                WHERE pu.project_id = ?
            )
    `, [projectId]);

    return result;
};

export default {
    createUser,
    getUserDetails,
    checkIfEmailExists,
    validateUserEmailAndPassword,
    getUserFromEmailId,
    getAllUsersNotInProject
}