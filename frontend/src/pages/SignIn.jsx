import axios from "axios";
import { useContext } from "react";
import { AuthData } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [login] = useContext(AuthData);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const payload = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    axios
      .post("http://localhost:5000/api/auth/register", payload)
      .then((res) => {
        login(res.data.accessToken);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <form
        className="flex flex-col p-3 outline-2"
        onSubmit={(e) => {
          handleRegister(e);
        }}
      >
        <label htmlFor="username">
          Username *:
          <input
            type="text"
            name="username"
            id="username"
            className="outline-1 m-2 p-1 rounded-xl"
            placeholder="some_user_name"
            required
          />
        </label>
        <br />
        <label htmlFor="email">
          Email *:
          <input
            type="email"
            name="email"
            id="email"
            className="outline-1 m-2 p-1 rounded-xl"
            placeholder="user@mail.com"
            required
          />
        </label>
        <br />
        <label htmlFor="password">
          Password *:
          <input
            type="password"
            name="password"
            id="password"
            className="outline-1 m-2 p-1 rounded-xl"
            required
          />
          <br />
        </label>
        <button
          type="submit"
          className="bg-[#FFBF00] p-1 rounded-2xl m-2 active:scale-95 transition-all"
        >
          Sign In
        </button>
      </form>

      <span className="text-sm p-2 font-bold">
        Note : Password must be of minimum 8 characters having atleast 1
        uppercase letter,atleast 1 lower letter,atleast 1 number and atleast 1
        symbol.
      </span>
    </div>
  );
};

export default SignIn;
