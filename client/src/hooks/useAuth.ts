import { useQuery } from "@tanstack/react-query";
import type { User, Profile } from "@shared/schema";

type AuthUser = User & {
  profile?: Profile;
};

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
