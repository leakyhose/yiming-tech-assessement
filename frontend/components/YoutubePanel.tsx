import Image from "next/image";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface Props {
  videos: Video[];
}

export default function YoutubePanel({ videos }: Props) {
  if (!videos.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-slate-700">Videos</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {videos.map((v) => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={v.thumbnail}
                alt={v.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-3xl">▶</span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-slate-800 line-clamp-2">{v.title}</p>
              <p className="mt-1 text-xs text-slate-500">{v.channelTitle}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
