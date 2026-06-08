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
    fullName: authResponse.fullName,
    role: authResponse.role,
    businessName: authResponse.businessName
  };

  localStorage.setItem("user", JSON.stringify(userData));
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};