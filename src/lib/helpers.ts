import client from "@/api/apiClient";
import { updateAuthInfo } from "@/redux/slices/authSlice";
export const setLocalStorage = (key: string, value: any) => {
  if (!key) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error while setting value of ${key} in local storage. `, e);
  }
};

export const initAuth = (dispatch: any) => {
  const saved = localStorage.getItem("token");

  if (saved) {
    const parsed = JSON.parse(saved);

    client.setToken(parsed.accessToken, parsed.refreshToken);
    dispatch(updateAuthInfo(parsed));
  }
};
