import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

const Room2: React.FC = () => {
    const { roomId, name } = useParams<{ roomId: string; name: string }>();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [showRemoteStream, setShowRemoteStream] = useState(false);
    const [remoteUserId, setRemoteUserId] = useState('');
    const [remoteUserName, setRemoteUserName] = useState('');
    const [remoteOffer, setRemoteOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [fromOffer, setFromOffer] = useState('');
    const [isInitiator, setIsInitiator] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const createPeerConnection = () => {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478',
                    ],
                },
            ],
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: remoteUserId });
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
                    name: name,
                });
            } catch (err) {
                console.error('Negotiation error:', err);
            } finally {
                isNegotiating = false;
            }
        };

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

    const handleJoinRoom = ({ name, userId }: { name: string; userId: string }) => {
        toast.success(`${name} is online`);
        setRemoteUserId(userId);
        setRemoteUserName(name);
    };

    const sendOffer = async () => {
        const offer = await peerConnectionRef.current?.createOffer();
        await peerConnectionRef.current?.setLocalDescription(offer);
        socket.emit('send-offer', {
            offer: peerConnectionRef.current?.localDescription,
            to: remoteUserId,
            name: name,
        });
    };

    const handleOfferReceived = async ({
        offer,
        from,
        name,
    }: {
        offer: RTCSessionDescriptionInit;
        from: string;
        name: string;
    }) => {
        toast.success(`${name} is calling!`);
        setRemoteOffer(offer);
        setFromOffer(from);
        setIsInitiator(false);
        setRemoteUserName(name);
    };

    const answerCaller = async () => {
        setShowRemoteStream(true);
        if (peerConnectionRef.current && remoteOffer !== null) {
            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(remoteOffer)
            );
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socket.emit('send-answer', {
                answer: peerConnectionRef.current.localDescription,
                to: fromOffer,
            });
        }
    };

    const handleReceivedAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        setShowRemoteStream(true);
        const peer = peerConnectionRef.current;
        await peer?.setRemoteDescription(new RTCSessionDescription(answer));
    };

    useEffect(() => {
        socket.emit('join-room', { roomId, name });

        socket.on('user-joined', handleJoinRoom);
        socket.on('offer-received', handleOfferReceived);
        socket.on('answer-received', handleReceivedAnswer);

        socket.on('show-call-button', () => {
            setIsInitiator(true);
        });

        socket.on('show-answer-button', () => {
            setIsInitiator(false);
        });

        return () => {
            socket.off('user-joined', handleJoinRoom);
            socket.off('offer-received', handleOfferReceived);
            socket.off('answer-received', handleReceivedAnswer);
            socket.off('show-call-button');
            socket.off('show-answer-button');

            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
            peerConnectionRef.current?.close();
        };
    }, [roomId, name]);

    useEffect(() => {
        localStream?.getTracks().forEach((track) => {
            peerConnectionRef.current?.addTrack(track, localStream);
        });
    }, [localStream]);

    useEffect(() => {
        handleLocalUserStreamAndCall();
        createPeerConnection();
    }, []);

    return (
        <div className='w-full flex p-5 justify-center gap-5'>
            {localStream && (
                <div className='space-y-2 shadow-md rounded-xl w-auto p-2 flex flex-col'>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        controls
                        playsInline
                        className='w-full h-full object-contain rounded-xl'
                    />
                    <span>{name}</span>
                    {!showRemoteStream && (
                        <div>
                            {isInitiator && !remoteOffer && (
                                <button onClick={sendOffer} className='border'>
                                    Call
                                </button>
                            )}
                            {!isInitiator && remoteOffer && (
                                <button onClick={answerCaller} className='border'>
                                    Answer
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
            {showRemoteStream && (
                <div className='space-y-2 shadow-md rounded-xl w-auto p-2 flex flex-col'>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        muted
                        controls
                        playsInline
                        className='w-full h-full object-contain rounded-xl'
                    />
                    <span>{remoteUserName}</span>
                </div>
            )}
        </div>
    );
};

export default Room2;
