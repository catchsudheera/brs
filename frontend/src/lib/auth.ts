import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export interface AuthSession {
  accessToken: string;
  // ... other session properties
}

export const requireAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthSession | null> => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.isAdmin) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  return session as AuthSession;
}; 