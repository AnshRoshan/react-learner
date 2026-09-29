import { ArrowLeft } from "lucide-react";
import { Link } from "../lib/router";
import { AtomLogo } from "../components/Logo";
import { Container } from "../components/ui";

export default function NotFound() {
  return (
    <Container className="grid min-h-[60vh] place-items-center py-24 text-center">
      <title>Page not found · React Projects</title>
      <div>
        <AtomLogo size={84} className="mx-auto animate-float opacity-80" />
        <p className="mt-6 font-display text-8xl font-black text-gradient">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold">This component didn't render.</h1>
        <p className="mx-auto mt-3 max-w-md text-ink2">
          The page you're looking for doesn't exist — or it unmounted while you weren't looking.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          <ArrowLeft size={17} /> Back to the start
        </Link>
      </div>
    </Container>
  );
}
