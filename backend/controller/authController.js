const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/userModel')


const loginUser = async (request, h) => {
    const {email, password} = request.payload;

    try {
        const user = await userModel.findUserByEmail(email);

        if (!user){
            return h.response({message: 'Invaild email or password'}).code(401)
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword){
            return h.response({message: 'Invalid email or password'}).code(401);
        }

        const token = jwt.sign(
            {id: user.user_id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        return h.response({token}).code(200);

    } catch (err){
        console.error(err);
        return h.response({message: 'Internal server error'}).code(500);
    }
}

const signUpUser = async (request, h) => {
    const { username, email, password } = request.payload;

    try {
        // Check if user already exists
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return h.response({ message: 'User already exists' }).code(400);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await userModel.createUser(username, email, hashedPassword);

        // Generate JWT token
        const token = jwt.sign(
            { id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return h.response({ token }).code(201);

    } catch (err) {
        console.error(err);
        return h.response({ message: 'Internal server error' }).code(500);
    }
}

module.exports ={
    loginUser,
    signUpUser,
}