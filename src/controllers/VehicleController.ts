import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import Logger from '../lib/logger';
import {
    VEHICLE_SPACE,
    DAYTIME_RATE,
    NIGHTTIME_RATE,
    CLUB_DISCOUNT_RATE
} from '../util/constants';

const prisma = new PrismaClient();

export const createVehicle = async (req: Request, res: Response) => {
    if(Object.keys(req.body).length === 0)
        return res.json('No car information sent. Unable to process the request.')

    const parkingLot = await prisma.parking.findUnique({
        where: {
            id: 1
        }
    });

    if (parkingLot) {
        const space = parkingLot.space;

        const { make, plate, type, club_pass } = req.body;
        const spaceNeeded = VEHICLE_SPACE[type];
        Logger.debug(`[CREATE] ${plate} | ${make}, ${type}, ${club_pass}, ${spaceNeeded}`);

        const car = await prisma.vehicle.findUnique({
            where: {
                plate: plate
            }
        });

        if (car) {
            return res.json('A car with that license plate already exists in the database!');
        } else if (space > spaceNeeded) {
            await prisma.parking.update({
                where: {
                    id: 1
                },
                data: {
                    space: space - spaceNeeded
                }
            });

            const vehicle = await prisma.vehicle.create({
                data: {
                    make,
                    plate,
                    type,
                    club_pass
                }
            });

            return res.json(vehicle);
        } else {
            return res.json('The parking lot is full! Try again later.');
        }
    } else {
        return res.json('Create a parking lot first!');
    }
}

export const getVehicleByPlate = async (req: Request, res: Response) => {
    const { plate } = req.params;

    if (!plate)
        return res.json('You need to provide a license plate for this query!');

    const vehicle = await prisma.vehicle.findUnique({
        where: {
            plate: plate
        }
    });

    if (!vehicle)
        return res.json('Vehicle not found.');

    res.json(vehicle);
}

export const removeVehicleByPlate = async (req: Request, res: Response) => {
    const { plate } = req.params;

    if (!plate)
        return res.json('You need to provide a license plate for this query!');

    const vehicle = await prisma.vehicle.findUnique({
        where: {
            plate: plate
        }
    });

    if (!vehicle)
        return res.json('Vehicle not found.');

    let daytimeHours = 0;
    let nighttimeHours = 0;

    let daytimeRate = DAYTIME_RATE[vehicle.type];
    let nighttimeRate = NIGHTTIME_RATE[vehicle.type];

    let start = new Date(Date.parse(vehicle.createdAt.toString()));
    let end = new Date(Date.now());

    let startHours = start.getHours();
    let endHours = end.getHours();

    if (start.getDate() == end.getDate()) {
        if (startHours >= 8 && endHours >= 8 && startHours <= 18 && endHours <= 18) {
            daytimeHours = endHours - startHours;
        } else if ((startHours < 8 && endHours < 8) || (startHours > 18 && endHours > 18)) {
            nighttimeHours = endHours - startHours;
        } else if (startHours < 8 && endHours > 18) {
            daytimeHours = 10;
            nighttimeHours = (8 - startHours) + (endHours - 18);
        } else if (startHours < 8 && endHours < 18) {
            daytimeHours = endHours - 8;
            nighttimeHours = 8 - startHours;
        } else {
            daytimeHours = 18 - startHours;
            nighttimeHours = endHours - 18;
        }
    }
    else {
        if (startHours < 8) {
            nighttimeHours = (24 - endHours) + (8 - startHours);
        } else if (startHours < 18) {
            daytimeHours = 18 - startHours;
            nighttimeHours = 24 - endHours;
        } else {
            nighttimeHours = 24 - startHours;
        }

        if (endHours < 8) {
            nighttimeHours += endHours - 24;
        } else if (endHours < 18) {
            daytimeHours += endHours - 8;
            nighttimeHours += -16;
        } else {
            daytimeHours += 10;
            nighttimeHours += (endHours - 18) + (8 - 10)
        }

        let dateDiff = (end.getUTCDate() - start.getUTCDate()) - 1;
        if (dateDiff > 0) {
            daytimeHours += 10 * dateDiff;
            nighttimeHours += 14 * dateDiff;
        }
    }

    if (daytimeHours == 0 && nighttimeHours == 0) {
        if (endHours >= 8 && endHours < 18) daytimeHours = 1;
        if (endHours < 8 || endHours >= 18) nighttimeHours = 1;
    }

    let priceBeforeDiscount = daytimeHours * daytimeRate + nighttimeHours * nighttimeRate;
    let priceAfterDiscount = priceBeforeDiscount * CLUB_DISCOUNT_RATE[vehicle.club_pass];

    let output = {
        'Daytime hours': daytimeHours,
        'Nighttime hours': nighttimeHours,
        'Price': priceBeforeDiscount.toFixed(2),
        'Club Pass Discount (%)': vehicle.club_pass != '' ? Math.ceil((1 - CLUB_DISCOUNT_RATE[vehicle.club_pass]) * 100) : 'None',
        'Final price': vehicle.club_pass != '' ? priceAfterDiscount.toFixed(2) : priceBeforeDiscount.toFixed(2)
    };

    Logger.debug(`[DELETE] ${vehicle.plate} | Daytime hours: ${daytimeHours}, Nighttime hours: ${nighttimeHours}`);

    await prisma.parking.update({
        where: {
            id: 1
        },
        data: {
            space: {
                increment: VEHICLE_SPACE[vehicle.type]
            }
        }
    });

    await prisma.vehicle.delete({
        where: {
            plate: vehicle.plate
        }
    });

    return res.json(output);
}