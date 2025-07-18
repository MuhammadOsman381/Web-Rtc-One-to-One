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
    const [remoteUserId, setRemoteUserId] = useState('');
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();


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


    const sendOffer = async () => {
        if (!remoteUserId || !localStream) return;
        const offer = await PeerService.sendOffer()
        socket.emit('send-offer', { offer, to: remoteUserId, roomId });
    };

    const handleOfferReceived = async (data: { offer: any; from: string }) => {
        const { offer, from } = data;
        // const peer = createPeerConnection();
        await peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection?.createAnswer();
        await peerConnection?.setLocalDescription(new RTCSessionDescription(answer));
        socket.emit('send-answer', { answer, to: from, roomId });
    };

    const handleAnswerReceived = async (data: { answer: any }) => {
        const { answer } = data;
        console.log(answer)
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
        const stream: MediaStream = localVideoRef.current?.srcObject as MediaStream;

        for (const track of stream.getTracks()) {
            // const peer: any = createPeerConnection();
            peerConnection?.addTrack(track, stream)
        }

    };



    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
        if (peerConnectionRef.current && data.candidate) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };

    const handleJoinRoom = (data: JoinRoomData) => {
        const { userId } = data;
        setRemoteUserId(userId);
    };



    useEffect(() => {
        if (!peerConnection) return;
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        };
    }, [peerConnection]);


    useEffect(() => {
        if (!roomId || !name) return;
        (async () => {
            await handleLocalUserStreamAndCall();
            socket.emit('join-room', { roomId, name });
            socket.on('user-joined', handleJoinRoom);
            socket.on('offer-received', handleOfferReceived);
            socket.on('answer-received', handleAnswerReceived);
            socket.on('ice-candidate', handleIceCandidate);
        })()

        return () => {
            socket.off('user-joined', handleJoinRoom);
            socket.off('offer-received', handleOfferReceived);
            socket.off('answer-received', handleAnswerReceived);
            socket.off('ice-candidate', handleIceCandidate);

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, name]);

    useEffect(() => {
        if (remoteUserId) {
            sendOffer();
        }
    }, [remoteUserId, localStream]);

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