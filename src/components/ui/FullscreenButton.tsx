import { useState } from 'react';
import { Button } from './button';
import { Maximize, Minimize } from 'lucide-react';

type FullscreenButtonProps = {
    containerRef: React.RefObject<HTMLElement | null>;
    className?: string;
};

export function FullscreenButton({ containerRef, className }: FullscreenButtonProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
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
    );
}