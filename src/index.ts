import express, {Request, Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import myUserRoute from './routes/MyuserRoutes';

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() =>{
    console.log(`Mongo DB Service Connected.`);
});

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

app.get("/hello", async (req: Request, res: Response) => {
    res.json({message: "Welcome from pixel soft api"});
});

//register routes
app.use('/api/my/user', myUserRoute);


app.listen(port, () => {
    console.log(`Server is listen on port 5000`);
});

