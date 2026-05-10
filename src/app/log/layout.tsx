import { Sidebar } from "@/components/Sidebar";

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gl-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
