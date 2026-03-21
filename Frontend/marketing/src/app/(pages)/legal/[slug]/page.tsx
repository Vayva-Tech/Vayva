import LegalDocPage from "../_components/LegalDocPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <LegalDocPage slug={slug} />;
}
