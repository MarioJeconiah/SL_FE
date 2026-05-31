import api from "./api";

export const register = async (data) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};

export const login = async (data) => {
  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

export const saveAuth = (authResponse) => {
  localStorage.setItem("token", authResponse.token);

  const userData = authResponse.user ? authResponse.user : {
    id: authResponse.id,
    username: authResponse.username,
    role: authResponse.role
  };

  localStorage.setItem("user", JSON.stringify(authResponse.user));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};