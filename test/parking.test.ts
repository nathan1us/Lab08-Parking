import app from '../src';
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);

const expect = chai.expect;

describe('Parking lots', () => {
    it('GET /parking', (done) => {
        chai.request(app)
            .get('/parking')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body.length).to.be.above(0);
                done();
            });
    });
});