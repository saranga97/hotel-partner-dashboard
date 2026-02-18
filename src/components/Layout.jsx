import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RoomDetailsModal from "./RoomDetailsModal";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-auto lg:pl-64">
        <Topbar
          setSidebarOpen={setSidebarOpen}
          onViewRoom={(room) => setSelectedRoom(room)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-8xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Room Details Modal (triggered from notifications) */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
};

export default Layout;