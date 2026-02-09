import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  ShoppingCart,
  Route,
  Truck,
  LogOut,
  Clock
} from "lucide-react";

import { getUserRole } from "../utils/roleUtils";

function AppLayout({ children }) {
  const role = getUserRole();
  const location = useLocation();

  function NavItem({ icon, label, to }) {
    const active = location.pathname === to;

    return (
      <Link to={to}>
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
          ${active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"}`}
        >
          {icon}
          <span>{label}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col">
        <div className="px-6 py-5 text-2xl font-bold text-white border-b border-slate-800">
          LogiGraph
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">

          {/* COMMON */}
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            to="/dashboard"
          />

          {/* ADMIN / MANAGER */}
          {(role === "ADMIN" || role === "MANAGER") && (
            <>
              <NavItem
                icon={<Warehouse size={18} />}
                label="Warehouses"
                to="/warehouses"
              />
              <NavItem
                icon={<Boxes size={18} />}
                label="Inventory"
                to="/inventory"
              />
              <NavItem
                icon={<ShoppingCart size={18} />}
                label="Orders"
                to="/orders"
              />
              <NavItem
                icon={<Truck size={18} />}
                label="Vehicles"
                to="/vehicles"
              />
              <NavItem
                icon={<Route size={18} />}
                label="Routing"
                to="/routing"
              />
            </>
          )}

          {/* CUSTOMER */}
          {role === "CUSTOMER" && (
            <>
              <NavItem
                icon={<ShoppingCart size={18} />}
                label="Products"
                to="/products"
              />
              <NavItem
                icon={<ShoppingCart size={18} />}
                label="My Orders"
                to="/orders"
              />
              <NavItem
                icon={<ShoppingCart size={18} />}
                label="Create Order"
                to="/customer/create-order"
              />
              <NavItem
                icon={<Clock size={18} />}
                label="Order Timeline"
                to="/order-timeline"
              />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 text-slate-400 text-sm">
          Logged in as
          <div className="text-white font-medium">
            {role}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white px-8 py-4 shadow flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-700">
            LogiGraph
          </h2>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
