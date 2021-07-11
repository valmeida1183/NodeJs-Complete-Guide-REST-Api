const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const isAuth = require('../middlewares/isAuth.middleware');

describe('isAuth middleware', () => {
    it('should throw an error if no authorization header is present', () => {
        const req = {
            get: headerName => null,
        };

        expect(isAuth.bind(this, req, {}, () => {})).to.throw('Authorization header is not provided');
    });

    it('should throw an error if authorization header is only one string', () => {
        const req = {
            get: headerName => 'bearer',
        };

        expect(isAuth.bind(this, req, {}, () => {})).to.throw('The token providades is invalid');
    });

    it('should throw an error if token cannot be virified', () => {
        const req = {
            get: headerName => 'bearer xyz',
        };

        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    });

    it('should yield a userId after decode token', () => {
        const req = {
            get: headerName => 'bearer adhkadhkadhkahdkasjdh',
        };

        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'abc' });

        isAuth(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;

        jwt.verify.restore();
    });
});
