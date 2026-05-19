import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { notify } from "@/components/ui/notify";

export function useProtectedAction() {
  const { user } = useAppSelector((state: any) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  return async function guard<T>(action: () => Promise<T> | T): Promise<T | undefined> {
    if (!user) {
      notify("Please login to continue", "warning");
      navigate("/sign-in", { state: { from: location.pathname } });
      return undefined;
    }
    return action();
  };
}
