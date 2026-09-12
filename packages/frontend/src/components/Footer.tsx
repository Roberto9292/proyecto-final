const AUTOR = "Roberto Pablo Ugarte Gutiérrez";

interface FooterProps {
  /** En fondo oscuro el texto se aclara para conservar el contraste. */
  tone?: "light" | "dark";
}

export default function Footer({ tone = "light" }: FooterProps) {
  return (
    <p
      className={`text-xs ${
        tone === "dark" ? "text-slate-500" : "text-gray-400"
      }`}
    >
      &copy; {new Date().getFullYear()} {AUTOR}. Todos los derechos reservados.
    </p>
  );
}
