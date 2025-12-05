import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: true,
        });
    }
    return socket;
};

export const joinOrderRoom = (orderId: number) => {
    const socket = getSocket();
    socket.emit('joinOrderRoom', { orderId: orderId.toString() });
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
