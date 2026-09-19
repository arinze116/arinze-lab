// Server-rendered JSON-LD. Renders one or more schema objects as
// <script type="application/ld+json"> tags in the initial HTML.
//
// CMS-managed titles and descriptions can reach structured data. Escaping the
// script-sensitive characters keeps a value from terminating this script tag.

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026") }}
        />
      ))}
    </>
  );
}
