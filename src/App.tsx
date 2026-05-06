import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { initAuth } from "./lib/helpers";
import { useAppDispatch } from "./store/hooks";
import { getMe } from "./store/features/user";
import client from "./api/apiClient";

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    client.setDispatch(dispatch);
    initAuth(dispatch);
    dispatch(getMe());
  }, [dispatch]);
  return <AppRoutes />;
}

export default App;
