import { MediaStream } from 'react-player';

declare module 'react-player' {
  interface ReactPlayerProps {
    url?: string | string[] | MediaStream | null; // Add MediaStream to url prop
  }
}