type TabId = "home" | "search" | "bookings" | "profile";

type BottomTabsProps = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
};

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "search", label: "Buscar", icon: "⌕" },
  { id: "bookings", label: "Reservas", icon: "◴" },
  { id: "profile", label: "Perfil", icon: "◎" },
];

export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      <div className="grid grid-cols-4 rounded-[1.75rem] border border-zinc-200/80 bg-white/95 p-2 shadow-2xl shadow-zinc-950/10 backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[0.7rem] font-black transition duration-300 active:scale-95 ${
                isActive
                  ? "bg-green-50 text-green-600"
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              }`}
              key={tab.id}
              onClick={() => onChange(tab.id)}
              type="button"
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
