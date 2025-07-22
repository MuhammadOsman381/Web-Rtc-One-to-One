import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const userData: { userId: string, name: string, roomId: string, isInitiator: boolean }[] = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ name, roomId }) => {
    socket.join(roomId);

    const existingUser = userData.find((u) => u.userId === socket.id);
    if (!existingUser) {
      const roomUsers = userData.filter(u => u.roomId === roomId);
      const isInitiator = roomUsers.length === 0;

      const user = {
        userId: socket.id,
        name,
        roomId,
        isInitiator,
      };

      userData.push(user);

      if (isInitiator) {
        socket.emit('show-call-button');
      } else {
        socket.to(roomId).emit('user-joined', user);
        socket.emit('show-answer-button');
      }
    }
  });

  socket.on('send-offer', ({ offer, to, name }) => {
    socket.to(to).emit('offer-received', { offer, from: socket.id, name });
  });

  socket.on('send-answer', ({ answer, to }) => {
    socket.to(to).emit('answer-received', { answer });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    const index = userData.findIndex(u => u.userId === socket.id);
    if (index !== -1) {
      const disconnectedUser = userData[index];
      const { roomId } = disconnectedUser;
      userData.splice(index, 1);

      const remainingUsers = userData.filter(u => u.roomId === roomId);
      if (remainingUsers.length === 1) {
        io.to(remainingUsers[0].userId).emit('show-call-button');
      }
    }

    console.log('Client disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
