import { Socket } from "socket.io"

let usersList: any[] = [];
export default (mongo: any) => {

    return {
        signUp: (io: any, socket: Socket) => {
            socket.on('signUp', async (payload: any) => {
                // Guardar en Base de Datos
                await mongo.db.collection('usuarios').findOneAndUpdate(
                        { correo: payload.email }, // Criterio de Busqueda
                        {
                            $set: {
                                nombreCompleto: payload.fullName,
                                fotoURL: payload.photoUrl
                            }
                        },
                        {
                            upsert: true
                        } 
                    )
                    .then((result: any) => console.log(result))
                    .catch((error: any) => console.log(error));

                usersList.push(payload)
                // Retransmitir la variable payload  a todos los clientes conectados
                io.emit('broadcast-message', usersList);
            });
        },
        disconnect: (socket: Socket) => {
            socket.on('disconnect', () => {
                console.log(`Desconexión del cliente con ID: ${socket.id}`);
                // TO DO: Guardar Log en Base de Datos
            });
        }
    }
};