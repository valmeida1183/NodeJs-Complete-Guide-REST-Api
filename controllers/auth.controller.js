const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const errorHelper = require('../utils/error.helper');
const { load } = require('dotenv');

exports.singup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorHelper.throwError('Validation failed.', 422, errors.array());
    }

    const { email, name, password } = req.body;
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({ email: email, password: hashedPassword, name: name });
            return user.save();
        })
        .then(savedUser => {
            res.status(201).json({ message: 'User created!', userId: savedUser._id });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

exports.singin = (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                errorHelper.throwError('Invalid email or password', 401);
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isValidPassword => {
            if (!isValidPassword) {
                errorHelper.throwError('Invalid email or password', 401);
            }

            // TODO create Jwt
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString(),
                },
                process.env.JWT_API_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ token, userId: loadedUser._id.toString() });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};
