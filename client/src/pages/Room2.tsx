import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import CallControls from '../components/CallControls';
import ChatSidebar from '../components/ChatSidebar';
import VideoView from '../components/VideoView';

const socket = io('https://webrtc-backend-qckx.onrender.com', {
  transports: ['polling', 'websocket'],
  secure: true,
});

const Room2: React.FC = () => {
  const { roomId, name } = useParams<{ roomId: string; name: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showRemoteStream, setShowRemoteStream] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState('');
  const [remoteUserName, setRemoteUserName] = useState('');
  const [remoteOffer, setRemoteOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [fromOffer, setFromOffer] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ from: string; message: string }[]>([]);
  const [isRemoteVideoEnlarged, setIsRemoteVideoEnlarged] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!showChat && messages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, showChat]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!stream) return;
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => peerConnectionRef.current?.addTrack(track, stream));
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
      toast.error('Could not access camera/microphone');
    }
  };

  const handleJoinRoom = ({ name, userId }: { name: string; userId: string }) => {
    toast.success(`${name} joined the room`, { icon: '👋' });
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
    toast.success('Calling...');
  };

  const handleOfferReceived = async ({ offer, from, name }: { offer: RTCSessionDescriptionInit; from: string; name: string }) => {
    toast(`${name} is calling you!`, { icon: '📞', duration: 5000 });
    setRemoteOffer(offer);
    setFromOffer(from);
    setIsInitiator(false);
    setRemoteUserName(name);
  };

  const answerCaller = async () => {
    setShowRemoteStream(true);
    if (peerConnectionRef.current && remoteOffer !== null) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('send-answer', { answer: peerConnectionRef.current.localDescription, to: fromOffer });
    }
  };

  const handleReceivedAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
    setShowRemoteStream(true);
    const peer = peerConnectionRef.current;
    await peer?.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const endCall = () => {
    setShowRemoteStream(false);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    socket.emit('end-call', { name, remoteUserId, isStreamExist: localStream ? true : false });
    toast.error('Call ended');
  };

  const handleEndCallReciever = (name: string) => {
    toast.error(`${name} ended the call`);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setShowRemoteStream(false);
    createPeerConnection();
  };

  const turnOnAndOffVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const turnOnAndOffAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleMessageReceived = ({ message, from }: { message: string; from: string }) => {
    setMessages(prev => [...prev, { from, message }]);
  };

  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send-message', { message, room: roomId, from: name });
      setMessages(prev => [...prev, { from: name || '', message: message.trim() }]);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.emit('join-room', { roomId, name });
    socket.on('user-joined', handleJoinRoom);
    socket.on('offer-received', handleOfferReceived);
    socket.on('answer-received', handleReceivedAnswer);
    socket.on('end-call-reciever', handleEndCallReciever);
    socket.on('message-received', handleMessageReceived);
    socket.on('show-call-button', () => setIsInitiator(true));
    socket.on('show-answer-button', () => setIsInitiator(false));
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
      socket.off('message-received', handleMessageReceived);
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [roomId, name]);

  useEffect(() => {
    createPeerConnection();
    handleLocalUserStreamAndCall();
  }, []);

  return (
    <div
      className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden transition-colors duration-500"
      data-theme={`connectly-${theme}`}
    >
      <div className="hidden md:flex flex-col w-20 bg-[var(--bg-surface)] border-r border-[var(--border)] items-center py-8 gap-10">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 rounded-2xl bg-[var(--brand-subtle)] flex items-center justify-center text-[var(--brand)] hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => {
              setShowChat(true);
              setUnreadCount(0);
            }}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition-all group"
          >
            <MessageSquare size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--bg-surface)]">
                {unreadCount}
              </span>
            )}
            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Messages
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header Info (Mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[var(--border)] bg-[var(--bg-overlay)] backdrop-blur-md z-30">
          <button onClick={() => navigate('/')} className="p-2 text-[var(--text-muted)]">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold truncate max-w-[150px]">Room: {roomId}</h1>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Encrypted</p>
          </div>
          <button
            onClick={() => {
              setShowChat(true);
              setUnreadCount(0);
            }}
            className="relative p-2 text-[var(--text-muted)]"
          >
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Video Port */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <VideoView
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            showRemoteStream={showRemoteStream}
            isRemoteVideoEnlarged={isRemoteVideoEnlarged}
            setIsRemoteVideoEnlarged={setIsRemoteVideoEnlarged}
            localUserName={name || 'Guest'}
            remoteUserName={remoteUserName}
          />
        </div>

        {/* Controls */}
        <CallControls
          showRemoteStream={showRemoteStream}
          isInitiator={isInitiator}
          remoteOffer={remoteOffer}
          isVideoOn={isVideoOn}
          isAudioOn={isAudioOn}
          onSendOffer={sendOffer}
          onAnswerCaller={answerCaller}
          onEndCall={endCall}
          onToggleVideo={turnOnAndOffVideo}
          onToggleAudio={turnOnAndOffAudio}
        />
      </main>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        messages={messages}
        userName={name || ''}
        message={message}
        setMessage={setMessage}
        onSendMessage={onSendMessage}
        unreadCount={unreadCount}
      />

      {/* Mobile Dark/Light Toggle (Floating) */}
      <div className="fixed top-20 right-4 z-40 md:hidden">
        <div className="glass-card p-1 rounded-full shadow-2xl border-white/10 overflow-hidden">
          {/* ThemeToggle is already handled in CallControls for desktop, adding a small one here for mobile header if needed, but it's cleaner in the controls area */}
        </div>
      </div>
    </div>
  );
};

export default Room2;