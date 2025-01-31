import { getSession } from "next-auth/react";

export const getRefreshedSession = async () => {
  // Force refresh the session
  const session = await getSession({ broadcast: false });
  
  if (session?.error === "RefreshAccessTokenError") {
    throw new Error("Failed to refresh access token");
  }

  return session;
}; 