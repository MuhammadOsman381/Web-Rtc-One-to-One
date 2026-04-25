import React from 'react';

interface VideoViewProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  showRemoteStream: boolean;
  isRemoteVideoEnlarged: boolean;
  setIsRemoteVideoEnlarged: (val: boolean) => void;
  localUserName: string;
  remoteUserName: string;
}

const VideoView: React.FC<VideoViewProps> = ({
  localVideoRef,
  remoteVideoRef,
  showRemoteStream,
  isRemoteVideoEnlarged,
  setIsRemoteVideoEnlarged,
  localUserName,
  remoteUserName,
}) => {
  return (
    <div className="flex-1 flex flex-col relative w-full h-full p-2 sm:p-4 transition-all duration-500 overflow-hidden">
      <div className="flex-1 relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
        
        {/* Main Display Area */}
        <div className="w-full h-full relative group">
          {/* Main Video */}
          <video
            ref={isRemoteVideoEnlarged && showRemoteStream ? remoteVideoRef : localVideoRef}
            autoPlay
            playsInline
            muted={!isRemoteVideoEnlarged}
            className="w-full h-full object-cover transition-transform duration-700"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none opacity-60 transition-opacity group-hover:opacity-100" />
          
          {/* Name Tag (Main) */}
          <div className="absolute top-6 left-6 flex items-center gap-2 py-2 px-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white font-medium shadow-xl">
            <div className={`w-2 h-2 rounded-full ${isRemoteVideoEnlarged && showRemoteStream ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
            <span className="text-sm tracking-wide">
              {isRemoteVideoEnlarged && showRemoteStream ? remoteUserName : `${localUserName} (You)`}
            </span>
          </div>
        </div>

        {/* Pin-in-Pin / Picture-in-Picture Miniature */}
        {showRemoteStream && (
          <div
            className={`absolute bottom-6 right-6 w-[35%] max-w-[200px] aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-105 active:scale-95 group/mini ${
              isRemoteVideoEnlarged ? 'border-blue-500/50' : 'border-orange-500/50'
            }`}
            onClick={() => setIsRemoteVideoEnlarged(!isRemoteVideoEnlarged)}
          >
            <video
              ref={isRemoteVideoEnlarged ? localVideoRef : remoteVideoRef}
              autoPlay
              playsInline
              muted={isRemoteVideoEnlarged}
              className="w-full h-full object-cover"
            />
            {/* Miniature Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover/mini:bg-transparent transition-colors" />
            
            {/* Miniature Name Tag */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-bold uppercase tracking-tighter">
              {isRemoteVideoEnlarged ? localUserName : remoteUserName}
            </div>
          </div>
        )}

        {/* Remote online indicator */}
        {remoteUserName && !showRemoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-center p-8 rounded-3xl bg-[var(--bg-surface)] shadow-2xl border border-[var(--border)] animate-scaleIn max-w-xs mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              </div>
              <h3 className="text-lg font-bold mb-1">{remoteUserName} is here</h3>
              <p className="text-sm text-[var(--text-muted)]">Wait for them to start the call or initiate it yourself.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VideoView;
