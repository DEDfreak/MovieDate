import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StitchDesign } from "./screens/StitchDesign/StitchDesign";
import { Home } from "./screens/Home/Home";
import { Wishlist } from "./screens/Wishlist/Wishlist";
import { Dates } from "./screens/Dates/Dates";
import { Profile } from "./screens/Profile/Profile";

export const App = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/dates" element={<Dates />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-date" element={<StitchDesign />} />
      </Routes>
    </Router>
  );
};