import { useEffect, useState } from "react";
import { usePath } from "./lib/router";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage";
import TheoryIndex from "./pages/TheoryIndex";
import TheoryPage from "./pages/TheoryPage";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  const path = usePath();
  const [palette, setPalette] = useState(false);

  // Every navigation starts at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);

  // Ctrl/⌘ + K opens the command palette
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const [root, slug] = path.split("?")[0].split("/").filter(Boolean);

  let page;
  if (!root) page = <Home />;
  else if (root === "projects") page = slug ? <ProjectPage key={slug} slug={slug} /> : <Projects />;
  else if (root === "theory") page = slug ? <TheoryPage key={slug} slug={slug} /> : <TheoryIndex />;
  else if (root === "about") page = <About />;
  else page = <NotFound />;

  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden="true">
        <i />
        <b />
      </div>
      <Nav onSearch={() => setPalette(true)} />
      <main>{page}</main>
      <Footer />
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  );
}
