import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";
import { LogOut } from "lucide-react";
import { clearSession, getUser } from "../../../../lib/auth";

export const AddDateSection = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const navItems = [
    { label: "Home",     href: "/" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Dates",    href: "/dates" },
    { label: "Profile",  href: "/profile" },
  ];

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-10 py-3 border-b border-[#48232f] w-full bg-[#221117]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-4">
        <div className="relative w-4 h-4">
          <img className="w-4 h-4" alt="CineDate Logo" src="/vector---1.svg" />
        </div>
        <h1 className="font-bold text-white text-lg font-['Plus_Jakarta_Sans',Helvetica]">
          CineDate
        </h1>
      </Link>

      {/* Nav + user */}
      <div className="flex items-center justify-end gap-8 flex-1">
        <NavigationMenu className="max-w-none">
          <NavigationMenuList className="flex gap-9">
            {navItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Link
                    to={item.href}
                    className={`font-medium text-sm font-['Plus_Jakarta_Sans',Helvetica] hover:text-white/80 transition-colors ${
                      location.pathname === item.href ? 'text-white font-bold underline underline-offset-4' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Avatar */}
        <Link to="/profile">
          <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity cursor-pointer">
            <AvatarFallback className="bg-[#e82833] text-white text-sm font-bold">
              {user?.display_name?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Log out"
          className="text-[#a08082] hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
