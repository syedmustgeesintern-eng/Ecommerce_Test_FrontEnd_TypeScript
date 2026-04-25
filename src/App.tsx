import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { initAuth } from "./lib/helpers";
import { useAppDispatch } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    initAuth(dispatch);
  }, []);
  return <AppRoutes />;
}

export default App;
