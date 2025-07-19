import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ReactPlayer from 'react-player';
import PeerService from '../services/Peer'

const socket = io('http://localhost:5000');

interface JoinRoomData {
    name: string;
    userId: string;
    roomId: string;
}

const Room: React.FC = () => {
    const { roomId, name } = useParams<{ roomId: string, name: string }>();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    // const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();

    const [flag, setFlag] = useState(false)

    const handleJoinRoom = async (data: JoinRoomData) => {
        const { userId } = data;
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        })
        peerConnectionRef.current = peer

        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer);

        const stream = localVideoRef?.current?.srcObject as MediaStream | null
        if (stream) {
            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });
        }

        socket.emit('send-offer', { offer, to: userId });
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

    const handleOfferReceived = async ({ offer, from }: { offer: any; from: string }) => {
        console.log('offer received:', offer);
        console.log('offer recieved peer ', peerConnectionRef.current)
        let peer = peerConnectionRef.current;
        await peer?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer?.createAnswer();
        await peer?.setLocalDescription(answer);
        socket.emit('send-answer', { answer, to: from });
    };


    const handleAnswerReceived = async (data: { answer: any }) => {
        const { answer } = data;
        console.log('answer recieved', answer)
        await peerConnectionRef?.current?.setRemoteDescription(new RTCSessionDescription(answer));
    };


    useEffect(() => {
        // console.log(peerConnectionRef.current)
        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = (event) => {
                console.log('event', event)
                const [remoteStream] = event.streams;
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };
        }
    }, [flag]);

    useEffect(() => {
        if (!roomId || !name) return;
        socket.emit('join-room', { roomId, name });
        socket.on('user-joined', handleJoinRoom);
        socket.on('offer-received', handleOfferReceived);
        socket.on('answer-received', handleAnswerReceived);

        return () => {
            socket.off('user-joined', handleJoinRoom);
            socket.off('offer-received', handleOfferReceived);
            socket.off('answer-received', handleAnswerReceived);

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, name]);


    useEffect(() => {
        handleLocalUserStreamAndCall();
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
                </div>
            )}
            {remoteVideoRef && (
                <div className='space-y-2 shadow-md rounded-xl w-auto p-2 flex flex-col'>
                    <ReactPlayer
                        ref={remoteVideoRef}
                        // playing
                        muted
                        controls
                        // url={remoteStream}
                        className='w-full h-full object-contain'
                    />
                    <span>Remote</span>
                </div>
            )}
        </div>
    );
};

export default Room;