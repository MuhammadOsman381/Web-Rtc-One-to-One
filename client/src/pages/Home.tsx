import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        if (!name.trim()) return toast.error('Enter your name');
        const newRoomId = uuidv4();
        localStorage.setItem('name', name);
        localStorage.setItem('roomId', newRoomId);
        navigate(`/room/${newRoomId}/${name}`);
    };

    const handleJoinRoom = () => {
        if (!name.trim() || !url.trim()) return toast.error('Please fill all fields');
        const roomId = url.split('/room')[1].split('/')[1]
        navigate(`/room/${roomId}/${name}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">

            {!isJoining ? (
                <div className='flex flex-col shadow bg-orange-100 space-y-3 items-center justify-center rounded-xl  p-5' >
                    <h1 className="text-xl font-bold">Welcome to the Meeting App</h1>
                    <input
                        className="input"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className='w-full flex space-x-2  ' >
                        <button
                            onClick={handleCreateRoom}
                            className="btn btn-sm btn-accent">Create Room
                        </button>

                        <button
                            onClick={() => setIsJoining(true)}
                            className="btn btn-sm btn-active">Join Room
                        </button>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col shadow bg-orange-100 space-y-3 items-center justify-center rounded-xl  p-5' >
                    <h1 className="text-xl font-bold">Join meeting</h1>
                    <input
                        className="input"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Enter meeting url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <div className='flex space-x-2 w-full' >
                        <button
                            onClick={handleJoinRoom}
                            className="btn btn-sm btn-accent"
                        >
                            Join
                        </button>
                        <button
                            onClick={() => setIsJoining(false)}
                            className="btn btn-error btn-sm"
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
