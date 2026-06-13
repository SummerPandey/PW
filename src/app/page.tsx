import Link from "next/link";

const projects = [
  {
    title: "Project One",
    description: "A short description of what this project does and why it matters.",
    href: "#",
    tags: ["Next.js", "TypeScript"],
  },
  {
    title: "Project Two",
    description: "Another highlight from your work — replace with the real thing.",
    href: "#",
    tags: ["React", "Tailwind"],
  },
  {
    title: "Project Three",
    description: "Pull these from the `project` table in your database once it's wired up.",
    href: "#",
    tags: ["Postgres", "Drizzle"],
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-16 px-6 py-24">
      {/* Hero */}
      <section className="flex flex-col gap-4">
        <p className="font-mono text-sm text-neutral-400">Hi, my name is</p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Your Name
        </h1>
        <h2 className="text-2xl font-semibold text-neutral-300 sm:text-3xl">
          I build things for the web.
        </h2>
        <p className="max-w-xl text-neutral-400">
          A short bio goes here. Talk about what you do, what you care about, and
          what you&apos;re looking for. Edit this in{" "}
          <code className="font-mono text-sm text-neutral-200">
            src/app/page.tsx
          </code>
          .
        </p>
        <div className="mt-4 flex gap-4">
          <Link
            href="#projects"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            View work
          </Link>
          <Link
            href="/api/auth/signin"
            className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-900"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.href}
              className="group flex flex-col gap-3 rounded-lg border border-neutral-800 p-5 transition hover:border-neutral-600 hover:bg-neutral-900/50"
            >
              <h3 className="text-lg font-semibold group-hover:text-white">
                {project.title}
              </h3>
              <p className="flex-1 text-sm text-neutral-400">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-800 px-2.5 py-0.5 font-mono text-xs text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-neutral-900 pt-8 text-sm text-neutral-500">
        Built with Next.js, Tailwind CSS, Drizzle &amp; Auth.js. Deployed on Vercel.
      </footer>
    </main>
  );
}
