interface AuthResponse {
  accessLevel: string[];
  isAdmin: boolean;
  isAllowed: boolean;
  email: string;
  playerId?: number;
}

export const validateUserAccess = async (token: string): Promise<AuthResponse | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/auth`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const userData = await response.json();
  console.log(userData);
  const accessLevel = userData.accessLevel || [];
  
  return {
    accessLevel,
    email: userData.player.email || '',
    playerId: userData.player.id,
    isAdmin: accessLevel.includes('ADMIN'),
    isAllowed: accessLevel.some((role: string) => ['USER', 'ADMIN'].includes(role))
  };
}; 