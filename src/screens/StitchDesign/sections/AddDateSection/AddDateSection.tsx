import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";

export const AddDateSection = (): JSX.Element => {
  const location = useLocation();

  // Navigation menu items data
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Dates", href: "/dates" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <header className="flex items-center justify-between px-10 py-3 border-b border-[#e5e8ea] w-full bg-[#FF00FF]">
      {/* Logo and Brand */}
      <Link to="/" className="flex items-center gap-4">
        <div className="relative w-4 h-4">
          <img className="w-4 h-4" alt="CineDate Logo" src="/vector---1.svg" />
        </div>
        <h1 className="font-bold text-white text-lg font-['Plus_Jakarta_Sans',Helvetica]">
          CineDate
        </h1>
      </Link>

      {/* Navigation and User Profile */}
      <div className="flex items-center justify-end gap-8 flex-1">
        {/* Navigation Menu */}
        <NavigationMenu className="max-w-none">
          <NavigationMenuList className="flex gap-9">
            {navItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Link
                    to={item.href}
                    className={`font-medium text-sm font-['Plus_Jakarta_Sans',Helvetica] hover:text-white/80 transition-colors ${
                      location.pathname === item.href ? 'text-white font-bold' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex items-center justify-center h-10 px-2.5 bg-[#472326] rounded-lg overflow-hidden">
          <div className="relative w-full h-full">
            <div className="w-full h-full bg-[url(/vector---0.svg)] bg-[100%_100%]" />
          </div>
        </div>

        {/* User Avatar */}
        <Link to="/profile">
          <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity">
            <AvatarImage src="..//depth-4--frame-2.png" alt="User profile" />
          </Avatar>
        </Link>
      </div>
    </header>
  );
};