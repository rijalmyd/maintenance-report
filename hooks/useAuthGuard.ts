import { User } from "@/generated/prisma/client";
import api from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";

// export const useAuthGuard = () => {
//   const router = useRouter();

//   const { data, isError, isLoading } = useQuery<User>({
//     queryKey: ["me"],
//     queryFn: async () => {
//       const res = await api.get("/auth/me");
//       return res.data.data;
//     },
//     retry: false,
//   });

//   useEffect(() => {
//     if (isError) router.push("/login");
//   }, [isError, router]);

//   return { user: data, isLoading };
// };
export const useAuthGuard = () => {
  const router = useRouter();

  const { data, isError, isLoading } = useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace("/login");
    }
  }, [isError, isLoading, router]);

  return { user: data, isLoading };
};


// export const useIsLoggin = () => {
//   const router = useRouter();

//   const { data, isLoading } = useQuery({
//     queryKey: ["me"],
//     queryFn: async () => {
//       const res = await api.get("/auth/me");
//       return res.data.data;
//     },
//     retry: false,
//   });

//   useEffect(() => {
//     if (data) router.back();
//   }, [data, router]);

//   return { isLoading };
// };
export const useIsLoggin = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (data) {
      router.replace("/admin/dashboard");
    }
  }, [data, router]);

  return { isLoading };
};
