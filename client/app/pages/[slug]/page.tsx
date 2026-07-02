import { redirect } from "next/navigation";

/** Старый URL /pages/:slug → публичный /:slug */
export default function LegacyPagesSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/${params.slug}`);
}
