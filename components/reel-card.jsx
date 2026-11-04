"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReelCard({ thumbnail, title, video, popular = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef(null);

  const handleOpenChange = (open) => {
    setIsOpen(open);

    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (video) {
      setIsOpen(true);
    }
  };

  const handleVideoCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 py-0 ${
          popular ? "ring-2 ring-accent" : ""
        }`}
        onClick={handlePlayClick}
      >
        {popular && (
          <div className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Popular
          </div>
        )}
        <div
          className="aspect-[9/16] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${thumbnail})` }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
              <Play className="text-primary" size={24} fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <h4 className="text-background font-semibold text-sm">{title}</h4>
          </div>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[95vw] w-auto p-0 overflow-hidden bg-black border-none sm:rounded-xl [&>button]:text-white [&>button]:opacity-90 [&>button:hover]:opacity-100">
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {video && (
            <video
              ref={videoRef}
              className="block max-h-[85vh] max-w-[95vw] w-auto h-auto mx-auto object-contain bg-black"
              src={video}
              controls
              playsInline
              onCanPlay={handleVideoCanPlay}
            />
          )}
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-white font-semibold text-sm">{title}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
