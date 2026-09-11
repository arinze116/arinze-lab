import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-center px-5 py-32 text-center md:px-8">
      <p className="font-mono text-6xl font-bold">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        That route isn&apos;t here.
      </h1>
      <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button href="/" variant="primary">
          Return Home
        </Button>
        <Button href="/projects" variant="secondary">
          Browse Projects
        </Button>
      </div>
    </section>
  );
}
