const { check, validationResult } = require('express-validator');

const validateSignup = [
    check('registerName', 'name must be greater  than 3+ charaters')
        .trim()
        .exists()
        .isLength({ min: 3 }),
    check('registerEmail', 'enter a valid email')
        .trim()
        .isEmail(),
    check('registerPassword', 'password must be 3+ characters')
        .trim()
        .isLength({ min: 3 }),
    check('registerConfirmPassword', 'password do not match')
        .trim()
        .custom((value, { req }) => {
            if (value == !req.body.registerPassword) {
                throw new Error('Password do not match')
            }
            return true;
        })   
]

const checkValidation = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = errors.array()
        return error
    }
}

exports.modules = { validateSignup, checkValidation }
