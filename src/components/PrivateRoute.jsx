import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("ceylonstay_token");
  const user = JSON.parse(localStorage.getItem("ceylonstay_user"));

  if (!token || !user || user.role !== "partner") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
