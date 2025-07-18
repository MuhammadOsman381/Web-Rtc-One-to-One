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

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ name, roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      name,
    });
  });

  socket.on('send-offer', ({ offer, to, roomId }) => {
    socket.to(to).emit('offer-received', { offer, from: socket.id });
  });

  socket.on('send-answer', ({ answer, to, roomId }) => {
    socket.to(to).emit('answer-received', { answer });
  });

  socket.on('ice-candidate', ({ candidate, to, roomId }) => {
    socket.to(to).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
