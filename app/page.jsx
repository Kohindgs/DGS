import Header from "./components/dgs3d/Header";
import Hero from "./components/dgs3d/Hero";
import NextSection from "./components/dgs3d/NextSection";
import SkipLink from "./components/dgs3d/SkipLink";
import { HOME_CONTENT } from "./lib/dgs-content";

export const metadata = {
  title: HOME_CONTENT.title,
  description: HOME_CONTENT.description,
};

export default function Home() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main">
        <Hero />
        <NextSection />
      </main>
    </>
  );
}
