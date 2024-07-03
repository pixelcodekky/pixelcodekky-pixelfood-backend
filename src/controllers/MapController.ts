import {Request, Response} from 'express';

const getTiler = async (req: Request, res:Response) => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong'});
    }
}



