import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Analytics from "./pages/Analytics";
import HotelProfile from "./pages/HotelProfile";
import RegisterHotel from "./pages/RegisterHotel";
import AddRoom from "./pages/AddRoom";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Private Routes with Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <PrivateRoute>
            <Layout>
              <Rooms />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <PrivateRoute>
            <Layout>
              <Bookings />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Layout>
              <Analytics />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hotel-profile"
        element={
          <PrivateRoute>
            <Layout>
              <HotelProfile />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/register-hotel"
        element={
          <PrivateRoute>
            <RegisterHotel />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-room"
        element={
          <PrivateRoute>
            <AddRoom />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
