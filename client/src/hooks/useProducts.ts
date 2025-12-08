import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductById, getProductsByCategory } from "../lib/api";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
};

export const useProduct = (productId: number) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });
};

export const useProductsByCategory = (categoryId: number | null) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: () => getProductsByCategory(categoryId!),
    enabled: !!categoryId,
  });
};
