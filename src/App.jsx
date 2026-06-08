import { AppProvider } from "./context/AppContext";
import { Router } from "./components/Router";
import "./styles/global.css";

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}