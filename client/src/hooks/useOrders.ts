import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../lib/api";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
};

export const useOrder = (orderId: number) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
  });
};
