interface Props {
  embed_url: string;
  resolved_name: string;
}

export default function MapEmbed({ embed_url, resolved_name }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <p className="bg-white px-4 py-2 text-sm font-medium text-slate-600">
        📍 {resolved_name}
      </p>
      <iframe
        src={embed_url}
        title={`Map of ${resolved_name}`}
        width="100%"
        height="300"
        className="block w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
