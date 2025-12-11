import { createWebHistory, createRouter } from "vue-router";
import OrderList from "./components/OrderList";
import OrderDetail from "./components/OrderDetail";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import ProductForm from "./components/ProductForm";
import ShippedOrdersPage from "./components/ShippedOrdersPage.vue";


const ShippedOrdersPage = {
  template: `
    <div style="padding: 2rem;">
      <h2>Shipped Orders</h2>
      <p>List of shipped orders will appear here.</p>
    </div>
  `
}

const routes = [
  { path: "/", component: OrderList },
  { path: "/orders", component: OrderList },
  { path: "/order/:id", component: OrderDetail },
  { path: "/products", component: ProductList },
  { path: "/product/:id", component: ProductDetail },
  { path: "/product/:id/edit", component: ProductForm },
  { path: "/product/add", component: ProductForm },
  { path: '/shipped', component: ShippedOrdersPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;