import authHandler from "../handler/authHandler.js";

export const SignInUser = async (req, res) => {
    const { email, password } = req.body;

    if(!email) {
        return res.status(400).json({ message: "Email Not Provided!!" });
    }

    const response = await authHandler.SignInUser(email, password);

    return res.status(response.status).json(response);
}

export const SignUpUser = async (req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ message: "Invalid Credentials Provided!!!" });
    }

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid Email Provided!!!" });
    }

    const response = await authHandler.SignUpUser(name, email, password);

    return res.status(response.status).json(response);
}

export const getUserDetails = async (req, res) => {
    const { userId } = req;

    if(!userId) {
        return res.status(400).json({ message: "Invalid Id Provided!!!" });
    }

    const response = await authHandler.getUserDetails(userId);

    return res.status(response.status).json(response);
}