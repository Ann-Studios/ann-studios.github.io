import { useEffect, useState } from 'react';
import { Button } from './button';
import { Maximize, Minimize } from 'lucide-react';

type FullscreenButtonProps = {
    containerRef: React.RefObject<HTMLElement | null>;
    className?: string;
};

export function FullscreenButton({ containerRef, className }: FullscreenButtonProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        const update = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
        document.addEventListener('fullscreenchange', update);
        return () => document.removeEventListener('fullscreenchange', update);
    }, [containerRef]);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        setError('');
        try {
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
        } catch {
            setError('Fullscreen is unavailable in this browser.');
        }
    };

    return (
        <>
        <Button onClick={toggleFullscreen} className={className}>
            {isFullscreen ? (
                <>
                    <Minimize className="w-4 h-4 mr-2" /> Exit Fullscreen
                </>
            ) : (
                <>
                    <Maximize className="w-4 h-4 mr-2" /> Fullscreen
                </>
            )}
        </Button>
        {error && <span role="status">{error}</span>}
        </>
    );
}
