import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { login, saveAuth } from "../../services/authService";

export default function LoginPage({ role, setPage }) {
  const { setCurrentUser } = useContext(AppContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};

    if (!username.trim()) {
      e.username = "Username wajib diisi";
    }

    if (!password.trim()) {
      e.password = "Password wajib diisi";
    }

    return e;
  };

  const handleLogin = async () => {
  const e = validate();

  if (Object.keys(e).length) {
    setErrors(e);
    return;
  }

  try {
    setLoading(true);
    setApiError("");

    const response = await login({ username, password });
    console.log("LOGIN RESPONSE:", response);

    // 1. Ekstrak data user secara aman & seragamkan propertinya
    // Kita pastikan properti 'name' atau 'fullName' terisi agar dashboard tidak kosong
    const loggedInUser = response.user ? {
      id: response.user.id,
      name: response.user.fullName || response.user.name || response.user.username,
      role: response.user.role
    } : {
      id: response.id,
      name: response.fullName || response.name || response.username,
      role: response.role
    };

    // 2. Simpan token secara manual ke localStorage agar aman dari issue data 'undefined'
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    // 3. Update state global AppContext agar seluruh komponen langsung mendeteksi user login
    setCurrentUser(loggedInUser);

    // 4. Deteksi Role untuk Routing halaman (bersihkan string dari spasi & case-insensitive)
    const userRole = (loggedInUser.role || "").toUpperCase().trim();

    if (userRole === "OWNER" || userRole === "EMPLOYEE") {
      setPage("user-dashboard");
    } else {
      setPage("admin-dashboard");
    }

  } catch (error) {
    console.error(error);
    setApiError(
      error.response?.data?.message ||
      "Username atau password salah"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          {role === "admin" ? "🛡️" : "👕"}
        </div>

        <h2 className="auth-title">
          Masuk {role === "admin" ? "Admin" : "User"}
        </h2>

        <p className="auth-sub">
          Silakan masuk ke akun Anda
        </p>

        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

        <div className="field">
          <label>Username</label>

          <input
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);

              setErrors((prev) => ({
                ...prev,
                username: ""
              }));
            }}
          />

          {errors.username && (
            <div className="err">
              {errors.username}
            </div>
          )}
        </div>

        <div className="field">
          <label>Password</label>

          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);

              setErrors((prev) => ({
                ...prev,
                password: ""
              }));
            }}
          />

          {errors.password && (
            <div className="err">
              {errors.password}
            </div>
          )}
        </div>

        <button
          className="btn-primary full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <div className="auth-link">
          <button
            onClick={() => setPage("register")}
          >
            ← Belum punya akun? Register
          </button>
        </div>
      </div>
    </div>
  );
}