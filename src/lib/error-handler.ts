import { redirect } from "next/navigation";
import { showErrorToast } from "./utils";

const errorHandler = (
  error: any,
  defaultMessage = "Something went wrong. Please try again later."
) => {
  if (error.status === 404) {
    showErrorToast("Route not found");
    return;
  }

  if (error?.response && JSON.stringify(error?.response) !== "{}") {
    if (error?.response?.status === 401) {
      // user unauthorized
      localStorage.removeItem("access_token");
      showErrorToast("Unauthorized access ... Please sign in to continue.");
      redirect("/sign-in");
    } else {
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      const respData = error?.response?.data;

      // If API returned a validation errors object/array, extract messages and show them
      const validationContainer = respData?.data?.errors || respData?.errors || respData?.data;

      if (validationContainer) {
        let messages: string[] = [];

        if (Array.isArray(validationContainer)) {
          messages = validationContainer.map((m: any) => (typeof m === "string" ? m : JSON.stringify(m)));
        } else if (typeof validationContainer === "object") {
          messages = Object.values(validationContainer)
            .flat()
            .map((m: any) => (typeof m === "string" ? m : JSON.stringify(m)));
        } else if (typeof validationContainer === "string") {
          messages = [validationContainer];
        }

        if (messages.length > 0) {
          showErrorToast(messages.join(" | "));
          return;
        }
      }

      showErrorToast(respData?.data?.message || respData?.message || defaultMessage);
    }
  } else {
    showErrorToast(defaultMessage);
  }
};

export default errorHandler;
