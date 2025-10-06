import { Sidebar } from "./components/Sidebar";
import { GameList } from "./components/GameList";

function App() {
  return (
    <div className="flex h-full w-full bg-[var(--color-bg-primary)]">
      <Sidebar />
      <div className="flex-1 h-full overflow-hidden">
        <GameList />
      </div>
    </div>
  );
}

export default App;
