import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/common/Header.tsx";
import {
  ApiNotificationProvider,
  useApiNotification,
} from "./contexts/ApiNotificationContext.tsx";
import { SearchFormProvider } from "./contexts/SearchFormProvider.tsx";
import ResultsPage from "./pages/ResultsPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import { setApiNotifier } from "./services/amadeus.ts";

interface AppProps {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

function ApiNotifierBridge(): null {
  const { notify } = useApiNotification();
  useEffect(() => {
    setApiNotifier(notify);
    return () => setApiNotifier(() => {});
  }, [notify]);
  return null;
}

function App({ toggleTheme, mode }: AppProps) {
  return (
    <ApiNotificationProvider>
      <ApiNotifierBridge />
      <SearchFormProvider>
        <Header toggleTheme={toggleTheme} mode={mode} />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </SearchFormProvider>
    </ApiNotificationProvider>
  );
}

export default App;
