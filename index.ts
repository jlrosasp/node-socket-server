import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression'
import { Socket } from 'socket.io';
import MongoHelper from './helpers/mongo.helper';
import SocketLogic from './sockets/socket.logic';
import ENV from './environments/env';

const mongo = MongoHelper.getInstance(ENV.MONGODB);

(async() => {
    await mongo.connect(ENV.MONGODB.DATABASE);
    if (mongo.statusConnection.status == 'success') {
        console.log(`Conexión exitosa a MonngoDB en el puerto ${ENV.MONGODB.PORT}`);
        // Correr Express
        const app = express();
        app.use(express.json());
        app.use(compression());
        let whitelist = [
            'http://localhost:4200'
        ];
        app.use(cors({
          origin: (origin, callback) => {
            // allow requests with no origin
            if(!origin) return callback(null, true);
            if(whitelist.indexOf(origin) === -1) {
              var message = `The CORS policy for this origin doesn't allow access from the particular origin.`;
              return callback(new Error(message), false);
            }
            return callback(null, true);
          }
        }));
        //app.use(cors({origin: true, credentials: true}));

        app.get('/', (req: Request, res: Response) => {
            res.status(200).json({
                ok: true,
                msg: 'API Real-Time funcionando correctamente'
            });
        })

        const httpServer = http.createServer(app);
        const socketIO = require('socket.io')(httpServer);

        // Funcionalidad Real-Time
        const socketLogic = SocketLogic(mongo);
        socketIO.on('connection', (socket: Socket) => {
            // TO DO: Lógica Real-Time
            console.log(`Nuevo cliente conectado con ID: ${socket.id}`);
            // Logic SignUp
            socketLogic.signUp(socketIO, socket);
            // Logic Disconnect
            socketLogic.disconnect(socket);
        });

        httpServer.listen(ENV.API.PORT, () => {
            console.log(`Servidor Express funcionando correctamente en puerto ${ENV.API.PORT}`);
        });

    } else {
        console.log('No se pudo establecer conexión co la base de datos');
    }
})();

// Handle Errors 
process.on('unhandleRejection', (error: any, promise) => {
    console.log(`Ocurrio un error no controlado de tipo promise rejection`, promise);
    console.log(`La descripción de error es la siguiente`, error);
    // Close MongoDB
    mongo.close();
    process.exit();
});
