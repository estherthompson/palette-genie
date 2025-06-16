const authController = require('../controller/authController')

module.exports =[
    {
        method: 'POST',
        path: '/login',
        handler: authController.loginUser,
        options:{
            cors: {
                origin: ['*'],
            },
        },
    },
    {
        method: 'POST',
        path: '/signup',
        handler: authController.signUpUser,
        options:{
            cors: {
                origin: ['*'],
            },
        },
    },
]