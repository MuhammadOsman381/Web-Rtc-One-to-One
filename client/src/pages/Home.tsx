import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        if (!name.trim()) return alert('Enter your name');
        const newRoomId = uuidv4();
        localStorage.setItem('name', name);
        localStorage.setItem('roomId', newRoomId);
        navigate(`/room/${newRoomId}/${name}`);
    };

    const handleJoinRoom = () => {
        if (!name.trim() || !roomId.trim()) return alert('Please fill all fields');
        navigate(`/room/${roomId}/${name}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <h1 className="text-2xl font-bold">Welcome to the Meeting App</h1>

            {!isJoining ? (
                <>
                    <input
                        className="p-2 border rounded"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        onClick={handleCreateRoom}
                        className="px-4 py-2 text-white bg-blue-500 rounded"
                    >
                        Create Room
                    </button>
                    <button
                        onClick={() => setIsJoining(true)}
                        className="px-4 py-2 text-white bg-green-500 rounded"
                    >
                        Join Room
                    </button>
                </>
            ) : (
                <>
                    <input
                        className="p-2 border rounded"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="p-2 border rounded"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button
                        onClick={handleJoinRoom}
                        className="px-4 py-2 text-white bg-green-500 rounded"
                    >
                        Join
                    </button>
                    <button
                        onClick={() => setIsJoining(false)}
                        className="px-4 py-2 text-white bg-gray-500 rounded"
                    >
                        Back
                    </button>
                </>
            )}
        </div>
    );
};

export default Home;
