import type { Metadata } from "next";
import { LookbookGrid } from "@/components/content/lookbook-grid";
import { Container, PageHeader } from "@/components/content/section";
import { getLookbook } from "@/lib/data";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Haseki on real Kochi streets. Editorial styling for every drop.",
};

export default async function LookbookPage() {
  const images = await getLookbook();
  return (
    <>
      <PageHeader
        eyebrow="Lookbook"
        title="Real streets. Extraordinary pieces."
        intro="Shot in and around Kochi, on ordinary afternoons. Tap any image to see it larger."
      />
      <Container>
        <LookbookGrid images={images} />
      </Container>
    </>
  );
}
