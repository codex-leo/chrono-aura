import { createContext, useState } from "react";

export const AuthData = createContext(null);

const AuthContext = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (token, role = "user") => {
    setAccessToken(token);
    if (role === "admin") {
      setIsAdmin(true);
    }
  };

  const logout = () => {
    setAccessToken(null);
  };

  return (
    <AuthData.Provider value={[login, logout, accessToken, isAdmin]}>
      {children}
    </AuthData.Provider>
  );
};

export default AuthContext;
