import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lain Studio — Cinematic Text Animations for Reels" },
      { name: "description", content: "Generate viral cinematic text animations for Reels & Shorts. 6 templates, 15 animation styles, full canvas control." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lain Studio" },
      { property: "og:description", content: "Cinematic text animations for Reels & Shorts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Oswald:wght@400;700&family=Montserrat:wght@400;700;900&family=Barlow+Condensed:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Serif+Display:ital@0;1&family=Cinzel:wght@400;700;900&family=Black+Han+Sans&family=Russo+One&family=Unbounded:wght@400;700;900&family=Archivo+Black&family=Outfit:wght@400;700;900&family=Instrument+Serif:ital@0;1&family=Big+Shoulders+Display:wght@400;700;900&family=Space+Grotesk:wght@400;700&family=Syne:wght@400;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
