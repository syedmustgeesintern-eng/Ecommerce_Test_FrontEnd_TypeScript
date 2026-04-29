import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { initAuth } from "./lib/helpers";
import { useAppDispatch } from "./store/hooks";
import { getMe } from "./store/features/user";

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    initAuth(dispatch);
  }, []);
  useEffect(() => {
  dispatch(getMe());
}, []);
  return <AppRoutes />;
}

export default App;
