import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`"))
        return <code key={index}>{part.slice(1, -1)}</code>;
      return part;
    });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Lightweight renderer for the repository's deliberately simple MDX content. */
export function ContentRenderer({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const nodes: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length)
      nodes.push(
        <p key={`p-${nodes.length}`}>{inline(paragraph.join(" "))}</p>,
      );
    paragraph = [];
  };
  const flushList = () => {
    if (list.length)
      nodes.push(
        <ul key={`l-${nodes.length}`}>
          {list.map((item) => (
            <li key={item}>{inline(item)}</li>
          ))}
        </ul>,
      );
    list = [];
  };

  lines.forEach((line) => {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const title = heading[2];
      const level = heading[1].length;
      if (level === 1)
        nodes.push(
          <h2 key={`h-${nodes.length}`} id={slugify(title)}>
            {title}
          </h2>,
        );
      else if (level === 2)
        nodes.push(
          <h2 key={`h-${nodes.length}`} id={slugify(title)}>
            {title}
          </h2>,
        );
      else
        nodes.push(
          <h3 key={`h-${nodes.length}`} id={slugify(title)}>
            {title}
          </h3>,
        );
    } else if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      flushParagraph();
      flushList();
      const title = line.trim().slice(2, -2);
      nodes.push(
        <h2 key={`h-${nodes.length}`} id={slugify(title)}>
          {title}
        </h2>,
      );
    } else if (/^-\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^-\s+/, ""));
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      paragraph.push(line.trim());
    }
  });
  flushParagraph();
  flushList();
  return <>{nodes}</>;
}

export function contentHeadings(content: string) {
  return content.split("\n").flatMap((line) => {
    const match =
      line.match(/^##\s+(.+)$/) ?? line.trim().match(/^\*\*([^*]+)\*\*$/);
    return match ? [{ title: match[1], id: slugify(match[1]) }] : [];
  });
}
