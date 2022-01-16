import app from '../src';
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);

const expect = chai.expect;

describe('Vehicle', () => {
    describe('POST /vehicle', () => {
        it('Empty query', (done) => {
            chai.request(app)
                .post('/vehicle')
                .send()
                .end((err, res) => {
                    expect(res.body).to.be.equal('No car information sent. Unable to process the request.');
                    done();
                });
        });

        it('New test vehicle', (done) => {
            let vehicle = {
                make: 'BMW',
                plate: 'CA1111BH',
                type: 'A',
                club_pass: 'Platinum'
            };
    
            chai.request(app)
                .post('/vehicle')
                .send(vehicle)
                .end((err, res) => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('make');
                    expect(res.body).to.have.property('plate');
                    expect(res.body).to.have.property('type');
                    expect(res.body).to.have.property('club_pass');
                    expect(res.body).to.have.property('createdAt');
                    done();
                });
        });

        it('Already existing test vehicle', (done) => {
            let vehicle = {
                make: 'BMW',
                plate: 'CA1111BH',
                type: 'A',
                club_pass: 'Platinum'
            };
    
            chai.request(app)
                .post('/vehicle')
                .send(vehicle)
                .end((err, res) => {
                    expect(res.body).to.be.equal('A car with that license plate already exists in the database!');
                    done();
                });
        });
    });

    describe('GET /vehicle', () => {
        it('Empty query', (done) => {
            chai.request(app)
                .get('/vehicle/')
                .end((err, res) => {
                    expect(res.body).to.be.equal('You need to provide a license plate for this query!');
                    done();
                });
        });

        it('Query by license plate', (done) => {
            chai.request(app)
                .get('/vehicle/CA1111BH')
                .end((err, res) => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('make');
                    expect(res.body).to.have.property('plate');
                    expect(res.body).to.have.property('type');
                    expect(res.body).to.have.property('club_pass');
                    expect(res.body).to.have.property('createdAt');
                    done();
                });
        });
    });

    describe('DELETE /vehicle', () => {
        it('Empty query', (done) => {
            chai.request(app)
                .delete('/vehicle/')
                .end((err, res) => {
                    expect(res.body).to.be.equal('You need to provide a license plate for this query!');
                    done();
                });
        });

        it('Delete test vehicle', (done) => {
            chai.request(app)
                .delete('/vehicle/CA1111BH')
                .end((err, res) => {
                    expect(res.body).to.have.property('Daytime hours');
                    expect(res.body).to.have.property('Nighttime hours');
                    expect(res.body).to.have.property('Price');
                    expect(res.body).to.have.property('Club Pass Discount (%)');
                    expect(res.body).to.have.property('Final price');
                    done();
                });
        });
    });
});
