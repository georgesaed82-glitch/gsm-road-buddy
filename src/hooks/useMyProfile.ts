import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, type MyProfile, type PermissionKey } from "@/lib/rbac.functions";

export function useMyProfile() {
  const fn = useServerFn(getMyProfile);
  return useQuery<MyProfile>({
    queryKey: ["my-profile"],
    queryFn: () => fn({ data: {} as never }),
    staleTime: 30_000,
  });
}

export function useCan(key: PermissionKey, mode: "view" | "edit" = "view") {
  const { data } = useMyProfile();
  if (!data) return false;
  if (data.is_master_owner) return true;
  const p = data.permissions[key];
  return mode === "edit" ? p.edit : p.view;
}