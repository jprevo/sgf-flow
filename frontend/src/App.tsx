import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GameList } from "./components/GameList";
import { ToastContainer } from "./components/Toast";
import { GamePage } from "./pages/GamePage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-full w-full bg-[var(--color-bg-primary)]">
        <Routes>
          <Route path="/" element={<GameList />} />
          <Route path="/game/:id" element={<GamePage />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
