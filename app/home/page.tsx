import { redirect } from "next/navigation";

// /home → redirection permanente vers /
// Le redirect 301 est déjà dans next.config.ts,
// cette page sert de filet de sécurité si le middleware intercepte en premier.
export default function HomePage() {
  redirect("/");
}

export const metadata = {
  robots: { index: false, follow: false },
};
