export const validateUserAccess = async (token: string) => {
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
    isAdmin: accessLevel.includes('ADMIN'),
    isAllowed: accessLevel.some((role: string) => ['USER', 'ADMIN'].includes(role))
  };
}; 