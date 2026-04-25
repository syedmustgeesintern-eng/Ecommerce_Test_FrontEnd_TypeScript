import { createAsyncThunk } from "@reduxjs/toolkit";

// Define a type for the wrapper function
type ThunkWrapperOptions = {
  successMessage?: string;
  errorMessage?: string;
  parseErrorMessage?: (error: unknown) => string;
  messageType?: string;
};

/**
 * Pass the ReturnType and ThunkArg type if need to pass data while dispatching the action e.g @Login action
 * and if no need to pass any argument then leave the ThunkArg and just pass the ReturnType type e.g @fetchMyUserInfo action
 */

export function createAsyncThunkWrapper<ReturnType, ThunkArg = void>(
  typePrefix: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payloadCreator: (arg: any, thunkApi?: any) => Promise<ReturnType>,
  options: ThunkWrapperOptions = {},
) {
  const { successMessage, errorMessage, messageType } = options;
  return createAsyncThunk<ReturnType, ThunkArg>(
    typePrefix,
    async (arg, thunkApi) => {
      try {
        const response = await payloadCreator(arg, thunkApi);
        // @ts-expect-error See the docs 'https://redux-toolkit.js.org/api/createAsyncThunk'
        return thunkApi.fulfillWithValue(response, {
          successMessage,
          messageType,
        });
      } catch (error: any) {
        let message = null;
        const hideToast = error?.config?.headers?.hideToast;

        if (!hideToast) {
          if (error?.message === "Network Error") {
            message = error.message;
          } else if (errorMessage) {
            message = errorMessage;
          } else if (error?.response?.data?.errors?.length) {
            message = error?.response?.data?.errors?.[0]?.message;
          } else if (error?.response?.data?.message) {
            // 🔥 ADD THIS (your API case)
            message = error.response.data.message;
          } else {
            message = handleErrorMessage(error);
          }
        }

        return thunkApi.rejectWithValue({
          message,
          messageType,
        });
      }
    },
  );
}

const handleErrorMessage = (error: any) => {
  console.log("$$$$$ ~ handleErrorMessage ~ error:", error);
  // if the response is invalid credentials means login is attempted so no need to call the refresh token api

  return "Something went wrong!";
};
