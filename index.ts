import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression'
import { Socket } from 'socket.io';

import ENV from './environments/env';

const app = express();
app.use(express.json());
app.use(compression());
// let whitelist = [
//     'http://localhost:4200'
// ];
// app.use(cors({
//   origin: (origin, callback) => {
//     // allow requests with no origin
//     if(!origin) return callback(null, true);
//     if(whitelist.indexOf(origin) === -1) {
//       var message = `The CORS policy for this origin doesn't allow access from the particular origin.`;
//       return callback(new Error(message), false);
//     }
//     return callback(null, true);
//   }
// }));

app.use(cors({origin: true, credentials: true}));



app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        ok: true,
        msg: 'API Real-Time funcionando correctamente'
    });
})

const httpServer = http.createServer(app);
const socketIO = require('socket.io')(httpServer);

// Funcionalidad Real-Time
let usersList: any[] = [];
socketIO.on('connection', (socket: Socket) => {
    // TO DO: Lógica Real-Time
    console.log(`Nuevo cliente conectado con ID: ${socket.id}`);
    console.log(`Aquí se detecta una nueva conexión de un cliente y se guarda en base de datos con ID: ${socket.id}`);


    socket.on('message', (payload: any) => {
        console.log(`Escuchando Mensaje `, payload);

        // Agregar Payload al Arreglo
        usersList.push(payload);

        // Retransmitir la variable payload  a todos los clientes conectados
        socketIO.emit('broadcast-message', usersList);
    });

    socket.on('disconnect', () => {
        console.log(`Desconexión del cliente con ID: ${socket.id}`);
        // TO DO: Guardar Log en Base de Datos
        console.log(`TO DO: Guardar Log en Base de Datos ${socket.id}`);
    });

});

httpServer.listen(ENV.API.PORT, () => {
    console.log(`Servidor Express funcionando correctamente en puerto ${ENV.API.PORT}`);
});