import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ReactPlayer from 'react-player';
import PeerService from '../services/Peer'
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

interface JoinRoomData {
    name: string;
    userId: string;
    roomId: string;
}

const Room2: React.FC = () => {
    const { roomId, name } = useParams<{ roomId: string, name: string }>();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const [remoteUserId, setRemoteUserId] = useState<string>('')
    const [remoteUserName, setRemoteUserName] = useState('')
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

    const [flag, setFlag] = useState(false)


    const createPeerConnection = () => {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        let isNegotiating = false;

        peer.onnegotiationneeded = async () => {
            if (isNegotiating) return;
            isNegotiating = true;
            try {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('send-offer', {
                    offer: peer.localDescription,
                    to: remoteUserId,
                });
            } catch (err) {
                console.error('Negotiation error:', err);
            } finally {
                isNegotiating = false;
            }
        };

        peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
        setPeerConnection(peer)
        peerConnectionRef.current = peer;
        return peer;
    };

    const handleLocalUserStreamAndCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    };

    const handleJoinRoom = async ({ name, userId }: { name: string, userId: string }) => {
        toast.success(`${name} with ${userId} is online`);
        setRemoteUserName(name)
        setRemoteUserId(userId)
        const offer = await peerConnectionRef.current?.createOffer()
        await peerConnectionRef.current?.setLocalDescription(offer);
        socket.emit('send-offer', {
            offer: peerConnectionRef.current?.localDescription,
            to: remoteUserId,
        });
    }

    const sendOffer = async () => {
        const offer = await peerConnectionRef.current?.createOffer()
        await peerConnectionRef.current?.setLocalDescription(offer);
        socket.emit('send-offer', {
            offer: peerConnectionRef.current?.localDescription,
            to: remoteUserId,
        });
    }

    const handleOfferRecieved = async ({ offer, from }: { offer: any, from: string }) => {
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socket.emit('send-answer', { answer: peerConnectionRef.current.localDescription, to: from });
        }
    };


    const handleRecievedAnswer = async ({ answer }: { answer: any }) => {
        console.log('Answer received:', answer);
        const peer: any = peerConnectionRef.current
        await peer.setRemoteDescription(
            new RTCSessionDescription(answer)
        );
        console.log('Remote description (answer) set successfully');
    };


    useEffect(() => {
        if (!roomId || !name) return;
        socket.emit('join-room', { roomId, name });
        socket.on('user-joined', handleJoinRoom);
        socket.on('offer-received', handleOfferRecieved)
        socket.on('answer-received', handleRecievedAnswer)
        return () => {
            socket.off('user-joined', handleJoinRoom);
            socket.off('offer-received', handleOfferRecieved)
            socket.off('answer-received', handleRecievedAnswer)

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, name]);


    useEffect(() => {
        localStream?.getTracks().forEach(track => {
            peerConnectionRef.current?.addTrack(track, localStream);
        });
    }, [localStream])

    useEffect(() => {
        handleLocalUserStreamAndCall();
        createPeerConnection()
    }, [])



    return (
        <div className='w-full flex p-5 justify-center gap-5'>
            {localStream && (
                <div className='space-y-2 shadow-md rounded-xl w-auto p-2 flex flex-col'>
                    <ReactPlayer
                        ref={localVideoRef}
                        playing
                        muted
                        controls
                        // url={localStream}
                        className='w-full h-full object-contain'
                    />
                    <span>{name}</span>

                    {name != remoteUserName
                        &&
                        <button onClick={sendOffer} className='border' >
                            Send Stream
                        </button>
                    }

                </div>
            )}
            {remoteVideoRef && (
                <div className='space-y-2 shadow-md rounded-xl w-auto p-2 flex flex-col'>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className='w-full h-full object-contain rounded-xl'
                    />
                    <span>Remote</span>
                </div>
            )}
        </div>
    );
};

export default Room2;