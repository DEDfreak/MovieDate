import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StitchDesign } from "./screens/StitchDesign/StitchDesign";
import { Home } from "./screens/Home/Home";
import { Wishlist } from "./screens/Wishlist/Wishlist";
import { Dates } from "./screens/Dates/Dates";
import { Profile } from "./screens/Profile/Profile";
import { Login } from "./screens/Login/Login";
import { isLoggedIn } from "./lib/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export const App = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/"          element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/add-date"  element={<RequireAuth><StitchDesign /></RequireAuth>} />
        <Route path="/dates"     element={<RequireAuth><Dates /></RequireAuth>} />
        <Route path="/wishlist"  element={<RequireAuth><Wishlist /></RequireAuth>} />
        <Route path="/profile"   element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </Router>
  );
};
