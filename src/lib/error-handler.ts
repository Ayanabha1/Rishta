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

  if (error.response && JSON.stringify(error.response) !== "{}") {
    if (error.response.status === 401) {
      // user unauthorized
      localStorage.removeItem("access_token");
      showErrorToast("Access denied ... Please sign in to continue.");
      redirect("/sign-in");
    } else {
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      showErrorToast(error?.response?.data?.data?.message || defaultMessage);
    }
  } else {
    showErrorToast(defaultMessage);
  }
};

export default errorHandler;
