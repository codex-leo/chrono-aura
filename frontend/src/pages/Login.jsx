import { useContext, useState } from "react";
import axios from "axios";
import { AuthData } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [withUsername, setWithUsername] = useState(false);

  const [login, accessToken] = useContext(AuthData);
  const navigate = useNavigate();

  const handleWithUsername = (e) => {
    setWithUsername(e.target.checked);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get("password");

    if (withUsername) {
      const username = formData.get("username");
      const payload = {
        username: username,
        password: password,
      };

      axios
        .post("http://localhost:5000/api/auth/login", payload)
        .then((res) => {
          login(res.data.accessToken, res.data.user.role);
          res.data.user.role === "admin"
            ? navigate("/admin-dashboard")
            : navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const email = formData.get("email");
      const payload = {
        email: email,
        password: password,
      };

      axios
        .post("http://localhost:5000/api/auth/login", payload)
        .then((res) => {
          login(res.data.accessToken, res.data.user.role);
          navigate("/admin-dashboard");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  return (
    <div className="flex justify-center h-screen items-center flex-col">
      <form
        className="p-5 flex flex-col outline-2"
        onSubmit={(e) => {
          handleLogin(e);
        }}
      >
        {withUsername ? (
          <label htmlFor="username">
            Username *:
            <input
              type="text"
              className="outline-1 rounded-xl p-1 m-2 "
              name="username"
              id="username"
              required
            />
          </label>
        ) : (
          <label htmlFor="email">
            Email *:
            <input
              type="email"
              className="outline-1 rounded-xl p-1 m-2 "
              name="email"
              id="email"
              required
            />
          </label>
        )}
        <br />
        <label htmlFor="password">
          Password *:
          <input
            type="password"
            className="outline-1 rounded-xl p-1 m-2"
            name="password"
            id="password"
            required
          />
        </label>
        <button className="bg-[#FFBF00] p-1 rounded-2xl m-2 active:scale-95 transition-all">
          Login
        </button>
      </form>
      <label htmlFor="useUsername">
        <input
          type="checkbox"
          name="useUsername"
          onChange={(e) => {
            handleWithUsername(e);
          }}
        />
        Use Username to login
      </label>
    </div>
  );
};

export default Login;
