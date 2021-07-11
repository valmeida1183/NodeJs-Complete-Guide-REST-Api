const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const userController = require('../controllers/user.controller');
const mongoDbConnect = require('../db/mongoDbConnect');

describe('User Controller - getCurrentUser', () => {
    before(done => {
        mongoose
            .connect(mongoDbConnect.testDbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                const user = new User({
                    _id: '60eb16c2cf9a2dcbe058d0cb',
                    email: 'test@test.com',
                    password: 'tester',
                    name: 'Test',
                    posts: [],
                });

                return user.save();
            })
            .then(() => {
                done();
            });
    });

    after(done => {
        // delete all users from test db.
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });

    it('should send a response with a valid user status for an existing user', done => {
        const req = { userId: '60eb16c2cf9a2dcbe058d0cb' };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.user.status;
            },
        };

        userController
            .getCurrentUser(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal('I am new!');
                done();
            });
    });
});
