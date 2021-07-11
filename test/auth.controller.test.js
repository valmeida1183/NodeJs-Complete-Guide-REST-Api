const { expect } = require('chai');
const sinon = require('sinon');

const User = require('../models/user');
const authController = require('../controllers/auth.controller');

describe('Auth Controller - Login', () => {
    it('should throw an error with state code 500 if accessing database fails', done => {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'test',
            },
        };

        authController
            .singin(req, {}, () => {})
            .then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 500);
                done();
            });
        User.findOne.restore();
    });
});
