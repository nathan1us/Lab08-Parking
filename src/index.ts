import * as bodyParser from 'body-parser';
import express from 'express';
import Logger from './lib/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from '../swagger.json';

import {
    createParkingLot,
    getAllParkingLots
} from './controllers/ParkingController';

import {
    createVehicle,
    getVehicleByPlate,
    removeVehicleByPlate
} from './controllers/VehicleController';

const app = express();

app.use(bodyParser.json());

app.use('/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerConfig, {
        swaggerOptions: {
            supportedSubmitMethods: []
        }
    })
);

app.get('/parking', getAllParkingLots);
app.post('/parking', createParkingLot);

app.get('/vehicle', getVehicleByPlate);
app.get('/vehicle/:plate', getVehicleByPlate);

app.post('/vehicle', createVehicle);

app.delete('/vehicle', removeVehicleByPlate);
app.delete('/vehicle/:plate', removeVehicleByPlate)

app.listen(3000, () => {
    Logger.info('🚀 Server ready at: http://localhost:3000');
    Logger.info('📚 API docs served at: http://localhost:3000/docs');
});

export default app;