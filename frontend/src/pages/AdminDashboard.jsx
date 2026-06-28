import { useContext } from "react";
import { AuthData } from "../context/AuthContext";

const AdminDashboard = () => {
  const [isAdmin] = useContext(AuthData);

  return (
    <div className="h-screen flex justify-center items-center">
      {isAdmin ? (
        <div>
          <h1>Welcome Admin</h1>
        </div>
      ) : (
        <h1>Sorry Your're not admin.</h1>
      )}
    </div>
  );
};

export default AdminDashboard;
