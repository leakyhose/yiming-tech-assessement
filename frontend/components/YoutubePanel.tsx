import Image from "next/image";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export default function YoutubePanel({ videos }: { videos: Video[] }) {
  if (!videos.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Videos</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {videos.map((v) => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={v.thumbnail}
                alt={v.title}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{v.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{v.channelTitle}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
