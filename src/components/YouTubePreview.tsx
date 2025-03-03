"use client";

import React from "react";

const YouTubePreview = ({ url }: { url: string }) => {
  // Fonction pour extraire l'ID de la vidéo YouTube
  const getYouTubeID = (link: string) => {
    const match = link.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeID(url);

  if (!videoId) return null; // Si pas d'ID valide, on n'affiche rien

  return (
    <div className="mt-4">
      <iframe
        className="w-full aspect-video rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video preview"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubePreview;
