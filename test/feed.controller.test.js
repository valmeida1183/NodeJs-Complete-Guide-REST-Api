const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');
const feedController = require('../controllers/feed.controller');
const mongoDbConnect = require('../db/mongoDbConnect');
const socketHelper = require('../utils/socket.helper');

describe('Feed Controller - getCurrentUser', () => {
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
        Post.deleteMany({})
            .then(() => {
                return User.deleteMany({});
            })
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                socketHelper.getIo.restore();
                done();
            });
    });

    it('should add a created post to the posts of creator', done => {
        sinon.stub(socketHelper, 'getIo');
        socketHelper.getIo.returns({ emit: () => {} });

        const req = {
            body: {
                title: 'Test Post!',
                content: 'This is a Test Post!',
            },
            file: {
                path: 'abc',
            },
            userId: '60eb16c2cf9a2dcbe058d0cb',
        };

        const res = {
            status: function () {
                return this;
            },
            json: () => {},
        };

        feedController
            .createPost(req, res, () => {})
            .then(savedUser => {
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1);
                done();
            })
            .catch(err => console.log(err));
    });
});
