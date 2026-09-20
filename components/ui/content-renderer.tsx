import Image from "next/image";
import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\s)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;

      if (part.startsWith("`"))
        return <code key={index}>{part.slice(1, -1)}</code>;

      const link = part.match(/^\[([^\]]+)\]\(([^ \s)]+)\)$/);

      if (link) {
        const [, label, href] = link;

        if (
          href.startsWith("/") ||
          href.startsWith("https://") ||
          href.startsWith("http://") ||
          href.startsWith("mailto:")
        ) {
          return (
            <a
              key={index}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={
                href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {label}
            </a>
          );
        }
      }

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
  let unorderedList: string[] = [];
  let orderedList: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      nodes.push(
        <p key={`p-${nodes.length}`}>
          {inline(paragraph.join(" "))}
        </p>,
      );
    }

    paragraph = [];
  };

  const flushUnorderedList = () => {
    if (unorderedList.length) {
      nodes.push(
        <ul key={`ul-${nodes.length}`}>
          {unorderedList.map((item, index) => (
            <li key={`ul-item-${index}`}>{inline(item)}</li>
          ))}
        </ul>,
      );
    }

    unorderedList = [];
  };

  const flushOrderedList = () => {
    if (orderedList.length) {
      nodes.push(
        <ol key={`ol-${nodes.length}`}>
          {orderedList.map((item, index) => (
            <li key={`ol-item-${index}`}>{inline(item)}</li>
          ))}
        </ol>,
      );
    }

    orderedList = [];
  };

  const flushLists = () => {
    flushUnorderedList();
    flushOrderedList();
  };

  lines.forEach((line) => {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);

    const image = line.match(
      /^!\[([^\]]*)\]\((\/images\/[a-zA-Z0-9_./-]+)\)$/,
    );

    const unorderedItem = line.match(/^[-*]\s+(.+)$/);
    const orderedItem = line.match(/^\d+[.)]\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushLists();

      const title = heading[2];
      const level = heading[1].length;

      if (level === 1 || level === 2) {
        nodes.push(
          <h2 key={`h-${nodes.length}`} id={slugify(title)}>
            {title}
          </h2>,
        );
      } else {
        nodes.push(
          <h3 key={`h-${nodes.length}`} id={slugify(title)}>
            {title}
          </h3>,
        );
      }
    } else if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      flushParagraph();
      flushLists();

      const title = line.trim().slice(2, -2);

      nodes.push(
        <h2 key={`h-${nodes.length}`} id={slugify(title)}>
          {title}
        </h2>,
      );
    } else if (image) {
      flushParagraph();
      flushLists();

      nodes.push(
        <Image
          key={`img-${nodes.length}`}
          src={image[2]}
          alt={image[1]}
          width={1200}
          height={800}
          className="h-auto w-full"
        />,
      );
    } else if (unorderedItem) {
      flushParagraph();
      flushOrderedList();

      unorderedList.push(unorderedItem[1]);
    } else if (orderedItem) {
      flushParagraph();
      flushUnorderedList();

      orderedList.push(orderedItem[1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushLists();
    } else {
      flushParagraph();
      flushLists();

      paragraph.push(line.trim());
    }
  });

  flushParagraph();
  flushLists();

  return <>{nodes}</>;
}

export function contentHeadings(content: string) {
  return content.split("\n").flatMap((line) => {
    const match =
      line.match(/^##\s+(.+)$/) ??
      line.trim().match(/^\*\*([^*]+)\*\*$/);

    return match
      ? [{ title: match[1], id: slugify(match[1]) }]
      : [];
  });
}
