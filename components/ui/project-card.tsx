import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "./card";
import { Badge } from "./badge";
import { ProjectMeta } from "@/types/content";

export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Image
          src={project.cover}
          alt={`${project.title} cover image`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <Badge status>{project.status}</Badge>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {project.stack.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
        <Link
          href={`/projects/${project.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline underline-offset-4"
        >
          View Project <ArrowUpRight size={14} />
        </Link>
      </div>
    </Card>
  );
}
