import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Users from "../database/users.js";
import { config } from "../config/config.js";

const SignInUser = async (email, password) => {
    if(!email) {
        return {
            status: 400,
            message: "Email Not Provided!!"
        }
    }

    const user = await Users.getUserFromEmailId(email);

    if(!user) {
        return {
            status: 400,
            message: "Invalid Email Id!!!"
        }
    }

    const validPassword = bcrypt.compare(password, user.password);

    if(!validPassword) {
        return {
            status: 400,
            message: "Invalid Email Id or Password!!!"
        }
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });

    user.token = token;

    delete user.password;

    return {
        status: 200,
        data: user
    }
}

const SignUpUser = async (name, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const isEmailRegistered = await Users.checkIfEmailExists(email);

        if(isEmailRegistered) {
            return {
                status: 400,
                message: "Email already registered"
            }
        }

        const newUser = await Users.createUser(email, name, hashedPassword);

        const token = jwt.sign({ id: newUser.id }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        });

        newUser.token = token;

        return {
            status: 200,
            data: newUser
        }
    } catch(err) {
        return {
            message: err,
            status: 400
        }
    }
}

const getUserDetails = async (userId) => {
    try {
        const data = await Users.getUserDetails(userId);

        return {
            status: 200,
            data
        }
    } catch(err) {
        return {
            message: err,
            status: 400
        }
    }
}

export default {
    SignInUser,
    SignUpUser,
    getUserDetails
}