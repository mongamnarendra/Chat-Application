const User = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "Not be an null value"
            })
        }
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(409).json({
                success: false,
                messsage: "Email already exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        return res.status(201).json({
            success: true,
            message: "Created",
            data: user
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            messsage: "Error while creating user",
            error: err
        })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // check for null values
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }

        // Check user existence
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (passwordCheck) {
            //generate jwt token
            const jwtToken = jwt.sign({userId:user._id,email:user.email}, "SECRET_KEY", {
                "expiresIn": "1h"
            })
            return res.status(200).json({
                success: true,
                message: "Authenticated",
                token: jwtToken
            })
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Email & Password"
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


module.exports = { signUp, login };