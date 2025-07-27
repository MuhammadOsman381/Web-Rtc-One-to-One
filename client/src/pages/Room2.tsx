import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { MdCall, MdCallEnd, MdScreenShare, MdStopScreenShare } from 'react-icons/md';
import { BsSend } from "react-icons/bs";
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from 'react-icons/hi2';
const socket = io('https://192.168.18.12:5000');

const Room2: React.FC = () => {
    const { roomId, name } = useParams<{ roomId: string; name: string }>();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [showRemoteStream, setShowRemoteStream] = useState(false);
    const [remoteUserId, setRemoteUserId] = useState('');
    const [remoteUserName, setRemoteUserName] = useState('');
    const [remoteOffer, setRemoteOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [fromOffer, setFromOffer] = useState('');
    const [isInitiator, setIsInitiator] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [isScreenShared, setIsScreenShared] = useState(false);
    const [message, setMessage] = useState('');
    const [showLocalScreenShare, setShowLocalScreenShare] = useState(false);
    const [showRemoteScreenShare, setShowRemoteScreenShare] = useState(false);
    const [messages, setMessages] = useState<{ from: string; message: string }[]>([]);

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const localScreenShareRef = useRef<HTMLVideoElement | null>(null);
    const remoteScreenShareRef = useRef<HTMLVideoElement | null>(null);
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

    const endCall = () => {
        setShowRemoteStream(false);
        if (localVideoRef.current?.srcObject) {
            const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach((track) => track.stop());
            localVideoRef.current.srcObject = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        socket.emit('end-call', {
            name,
            remoteUserId,
            isStreamExist: localStream ? true : false,
        });
    };

    const handleEndCallReciever = (name: string, isStreamExist: boolean) => {
        toast.error(`${name} ended the call`);
        if (localVideoRef.current?.srcObject) {
            const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach((track) => track.stop());
            localVideoRef.current.srcObject = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        setShowRemoteStream(false);
    };

    const turnOnAndOffVideo = () => {
        if (localVideoRef.current) {
            const videoRef = localVideoRef.current.srcObject as MediaStream;
            const videoTrack = videoRef.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const turnOnAndOffAudio = () => {
        if (localVideoRef.current) {
            const videoRef = localVideoRef.current.srcObject as MediaStream;
            const audioTrack = videoRef.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    };

    const shareScreen = async () => {
        try {
            const peer = peerConnectionRef.current;
            if (!peer) return;
            setShowLocalScreenShare(true);
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            localScreenShareRef.current!.srcObject = screenStream;
            screenStream.getTracks().forEach((track) => {
                peer.addTrack(track, screenStream);
            });
            socket.emit("screen-share-started", { name: name, to: remoteUserId });
            setIsScreenShared(true);
        } catch (error) {
            console.error("Error sharing screen:", error);
        }
    };

    const handleScreenShareStartedRemote = ({ name }: { name: string }) => {
        const peer = peerConnectionRef.current;
        if (!peer) return;
        setShowRemoteScreenShare(true);
        toast.success(`${name} started screen sharing`);
        peer.ontrack = (event) => {
            if (remoteScreenShareRef.current) {
                remoteScreenShareRef.current.srcObject = event.streams[1];
            }
        };
    };


    const handleMessageReceived = ({ message, from }: { message: string; from: string }) => {
        setMessages((prevMessages) => [...prevMessages, { from, message }]);
    };

    useEffect(() => {
        socket.emit('join-room', { roomId, name });
        socket.on('user-joined', handleJoinRoom);
        socket.on('offer-received', handleOfferReceived);
        socket.on('answer-received', handleReceivedAnswer);
        socket.on('end-call-reciever', handleEndCallReciever);
        socket.on('screen-share-started-remote', handleScreenShareStartedRemote);
        socket.on('message-received', handleMessageReceived)
        socket.on('show-call-button', () => {
            setIsInitiator(true);
        });
        socket.on('show-answer-button', () => {
            setIsInitiator(false);
        });
        socket.on('ice-candidate', async ({ candidate }: any) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
        return () => {
            socket.off('user-joined', handleJoinRoom);
            socket.off('offer-received', handleOfferReceived);
            socket.off('answer-received', handleReceivedAnswer);
            socket.off('show-call-button');
            socket.off('show-answer-button');
            socket.off('end-call-reciever', handleEndCallReciever);
            socket.off('ice-candidate');
            socket.off('screen-share-started-remote', handleScreenShareStartedRemote);
            socket.off('message-received', handleMessageReceived)
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
        <div className='flex  flex-wrap justify-center h-auto w-full'>
            <div className='w-full lg:w-[79vw] flex flex-col  p-5 justify-center items-center h-full gap-5'>
                <div className='w-full flex flex-col md:flex-row justify-center gap-5'>
                    {localStream && (
                        <div className="card rounded-xl bg-orange-100">
                            <figure className="px-0 pt-0">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    className="rounded-t-xl w-full max-w-full"
                                />
                            </figure>
                            <div className="p-3 items-center text-center w-full">
                                <h2 className="font-bold text-xl w-full text-center">{name}</h2>
                            </div>
                        </div>
                    )}
                    {showRemoteStream && (
                        <div className="card rounded-xl bg-orange-100">
                            <figure className="px-0 pt-0">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="rounded-t-xl w-full max-w-full"
                                />
                            </figure>
                            <div className="p-3 items-center text-center w-full">
                                <h2 className="font-bold text-xl w-full text-center">{remoteUserName}</h2>
                            </div>
                        </div>
                    )}
                </div>

                <div className='flex items-center justify-center bg-orange-200 px-3 py-2 rounded-full h-auto gap-3 flex-wrap'>
                    {!showRemoteStream ? (
                        <>
                            {isInitiator && !remoteOffer && (
                                <span onClick={sendOffer} className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                    <MdCall size='25' />
                                </span>
                            )}
                            {!isInitiator && remoteOffer && (
                                <span onClick={answerCaller} className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                    <MdCallEnd size='25' />
                                </span>
                            )}
                            <span onClick={turnOnAndOffVideo} className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                {isVideoOn ? <FaVideoSlash size='25' /> : <FaVideo size='25' />}
                            </span>
                            <span onClick={turnOnAndOffAudio} className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                {isAudioOn ? <HiMiniSpeakerXMark size='25' /> : <HiMiniSpeakerWave size='25' />}
                            </span>
                        </>
                    ) : (
                        <div className='flex items-center justify-center rounded-full h-auto gap-3 flex-wrap'>
                            <span className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                <MdCallEnd onClick={endCall} size='25' />
                            </span>
                            <span onClick={turnOnAndOffVideo} className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                {isVideoOn ? <FaVideoSlash size='25' /> : <FaVideo size='25' />}
                            </span>
                            <span onClick={turnOnAndOffAudio} className='bg-orange-100 text-orange-900 rounded-full p-2'>
                                {isAudioOn ? <HiMiniSpeakerXMark size='25' /> : <HiMiniSpeakerWave size='25' />}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className='w-full lg:w-1/5 p-5  space-y-3'>
                <div className='bg-orange-100 w-full rounded-xl h-[54vh] overflow-auto'>
                    <div className="p-4">

                        {
                            messages.length == 0 && <div className='text-center w-full'>Chatting is not started yet</div>
                        }

                        {messages.map((msg, index) => (
                            msg.from === name ? (
                                <div key={index} className="chat chat-end">
                                    <div className="chat-header">{msg.from}</div>
                                    <div className="chat-bubble">{msg.message}</div>
                                </div>
                            ) : (
                                <div key={index} className="chat chat-start">
                                    <div className="chat-image avatar"></div>
                                    <div className="chat-header">{msg.from}</div>
                                    <div className="chat-bubble">{msg.message}</div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
                <div className='bg-orange-100 h-auto w-full space-x-3 rounded-xl px-4 py-4 flex items-center justify-center'>
                    <input
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        type="text"
                        className='input w-full'
                    />
                    <span
                        onClick={() => {
                            if (message.trim() !== '') {
                                socket.emit('send-message', { message, room: roomId, from: name });
                                setMessage('');
                            }
                        }}
                        className='bg-orange-200 p-3 rounded-full flex items-center justify-center'
                    >
                        <BsSend />
                    </span>
                </div>
            </div>
        </div>

    );
};

export default Room2;