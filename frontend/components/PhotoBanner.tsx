import Image from "next/image";

interface Photo {
  url: string;
  alt: string;
  photographer: string;
  photographer_url: string;
}

interface Props {
  photos: Photo[];
}

export default function PhotoBanner({ photos }: Props) {
  if (!photos.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="flex gap-2 h-48 sm:h-64">
        {photos.map((photo, i) => (
          <div key={i} className={`relative flex-1 overflow-hidden rounded-xl ${i > 0 ? "hidden sm:block" : ""}`}>
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            {/* Photographer credit (Unsplash requirement) */}
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1 right-2 text-xs text-white/80 hover:text-white drop-shadow"
            >
              © {photo.photographer}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
