// Server-rendered JSON-LD. Renders one or more schema objects as
// <script type="application/ld+json"> tags in the initial HTML.
//
// The data is static and developer-controlled (built in lib/schema.ts), so
// JSON.stringify into dangerouslySetInnerHTML is the standard, safe Next.js
// pattern for structured data — no user input is ever serialised here.

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
