import type { Route } from "./+types/home";
import { AppRouter } from "../components/AppRouter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SICUA - Sistema de Inventario y Control de Ventas" },
    { name: "description", content: "Sistema completo para gestión de inventario y ventas" },
  ];
}

export default function Home() {
  return <AppRouter />;
}
