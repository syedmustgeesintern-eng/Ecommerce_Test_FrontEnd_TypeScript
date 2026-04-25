import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import "./index.css";
import App from "./App.tsx";
import { ToastContainer } from "react-toastify";
// import { store } from './redux/store' // adjust path if needed

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer />
    </Provider>
  </StrictMode>,
);
