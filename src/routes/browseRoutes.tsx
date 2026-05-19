import AllProducts from "@/pages/AllProducts";
import ProductDetails from "@/pages/ProductDetails";

export const browseRoutes = [
  { path: "/products", element: <AllProducts /> },
  { path: "/products/details/:productId", element: <ProductDetails /> },
];
