import { User } from "@/generated/prisma/client";
import { handleApiError } from "@/lib/errorHandler";
import api from "@/lib/fetcher";
import { LoginUserSchema, RegisterUserSchema, UpdateUserSchema } from "@/schema/userSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";
import z from "zod";

// users login
export const useLogin = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof LoginUserSchema>) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data.user.role !== "ADMIN") {
        toast.error("User tidak memiliki hak akses.");
      }
      localStorage.setItem("token", data.data.token);
      toast.success("Login berhasil.");
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    },
    onError: (error: unknown) => {
      handleApiError(error, "Login gagal");
    },
  });

  return mutation;
};

// get all users
export const useGetAllUser = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get(`/users`);
      return res.data.data;
    },
  });
};

// create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof RegisterUserSchema>) => {
      const res = await api.post(`/users/register`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role created successfully");
    },
    onError: () => {
      toast.error("Failed to create role");
    },
  });
};

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<z.infer<typeof UpdateUserSchema>>) => {
      const res = await api.patch(`/users/${userId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });
};

export const useDeleteUser = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });
};