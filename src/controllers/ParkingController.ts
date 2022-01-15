import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const createParkingLot = async (req: Request, res: Response) => {
    const parkingLot = await prisma.parking.create({
        data: {
            space: 200
        }
    });

    return res.json(parkingLot);
}

export const getAllParkingLots = async (req: Request, res: Response) => {
    const parkingLots = await prisma.parking.findMany();

    return res.json(parkingLots);
}