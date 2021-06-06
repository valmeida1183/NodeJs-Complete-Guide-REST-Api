const { validationResult } = require('express-validator');

const User = require('../models/user');
const errorHelper = require('../utils/error.helper');

const getCurrentUser = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                errorHelper.throwError('User not Found', 404);
            }

            res.status(200).json({ message: 'Current user fetched', user });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

const updateUserStatus = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorHelper.throwError('Validation failed', 422, errors.array());
    }

    const { status } = req.body;

    User.findById(req.userId)
        .then(user => {
            user.status = status;

            return user.save();
        })
        .then(() => {
            res.status(200).json({ message: 'User status is updated!' });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

module.exports = {
    getCurrentUser,
    updateUserStatus,
};
