// import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import httpStatusCodes from "../config/httpStatusCodes.js";
import messages from "../config/messages.js";
import users from "../database/users.js";
import { config } from "../config/config.js";

const checkIfTokenIsValid = async (token) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await users.getUserDetails(decoded.id);
        return {
            valid: !!user,
            userId: decoded.id,
            userDetails: {
                name: user.name,
                email: user.email
            }
        };
    } catch (err) {
        return { valid: false, userId: null, userDetails: null };
    }
}

const verifyToken = async (req, res, next) => {
    try {
      const token = req.headers["x-access-token"] || req.headers.authorization;

      if (!token)
        return res
          .status(httpStatusCodes.UNAUTHORIZED)
          .json({ message: messages.invalidToken });

        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.id;
        
        const user = await users.getUserDetails(decoded.id);
        if (!user) {
            return res
                .status(httpStatusCodes.UNAUTHORIZED)
                .json({ message: messages.invalidToken2 });
        }
        return next();
    } catch (err) {
        return res
            .status(httpStatusCodes.UNAUTHORIZED)
            .json({ message: messages.tokenExpired });
    }
};

export default { 
    verifyToken,
    checkIfTokenIsValid
};