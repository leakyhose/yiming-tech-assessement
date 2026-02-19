export default function MapEmbed({ embed_url, resolved_name }: { embed_url: string; resolved_name: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <p className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-b border-gray-200">{resolved_name}</p>
      <iframe
        src={embed_url}
        title={`Map of ${resolved_name}`}
        width="100%"
        height="300"
        className="block border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
