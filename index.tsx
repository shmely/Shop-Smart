import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ShopSmartProvider } from "./context/ShopSmartContext";
import Header from "./components/Header/Header";

const rootElement =
  document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Could not find root element to mount to"
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ShopSmartProvider>
      <Header />
      <App />
    </ShopSmartProvider>
  </React.StrictMode>
);
