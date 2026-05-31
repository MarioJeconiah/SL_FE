import { useState } from "react";
import { register } from "../../services/authService";

export default function RegisterPage({ setPage }) {
  const [form, setForm] = useState({
    businessName: "",

    ownerFullName: "",
    ownerUsername: "",
    ownerPassword: "",

    employeeFullName: "",
    employeeUsername: "",
    employeePassword: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const upd = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: ""
    }));
  };

  const validate = () => {
    const e = {};

    if (!form.businessName.trim())
      e.businessName = "Nama laundry wajib diisi";

    if (!form.ownerFullName.trim())
      e.ownerFullName = "Nama owner wajib diisi";

    if (!form.ownerUsername.trim())
      e.ownerUsername = "Username owner wajib diisi";

    if (!form.ownerPassword.trim())
      e.ownerPassword = "Password owner wajib diisi";

    if (!form.employeeFullName.trim())
      e.employeeFullName = "Nama employee wajib diisi";

    if (!form.employeeUsername.trim())
      e.employeeUsername = "Username employee wajib diisi";

    if (!form.employeePassword.trim())
      e.employeePassword = "Password employee wajib diisi";

    return e;
  };

  const handleRegister = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      const payload = {
        businessName: form.businessName,

        ownerUsername: form.ownerUsername,
        ownerPassword: form.ownerPassword,
        ownerFullName: form.ownerFullName,

        employeeUsername: form.employeeUsername,
        employeePassword: form.employeePassword,
        employeeFullName: form.employeeFullName
      };

      console.log("REGISTER PAYLOAD:", payload);

      await register(payload);

      setSuccess(
        "Registrasi laundry berhasil!"
      );

      setTimeout(() => {
        setPage("login-admin");
      }, 1500);

    } catch (error) {

      console.error(error);

      setApiError(
        error.response?.data?.message ||
        "Registrasi gagal"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-wrap">
      <div
        className="auth-card"
        style={{ maxWidth: 700 }}
      >
        <div className="auth-logo">🏢</div>

        <h2 className="auth-title">
          Registrasi Laundry
        </h2>

        <p className="auth-sub">
          Buat bisnis laundry beserta akun owner dan employee
        </p>

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

        <div className="field">
          <label>Nama Laundry</label>
          <input
            value={form.businessName}
            onChange={upd("businessName")}
          />
          {errors.businessName && (
            <div className="err">
              {errors.businessName}
            </div>
          )}
        </div>

        <h4 style={{ marginTop: 20 }}>
          Data Owner
        </h4>

        <div className="two-col">
          <div className="field">
            <label>Nama Owner</label>
            <input
              value={form.ownerFullName}
              onChange={upd("ownerFullName")}
            />
            {errors.ownerFullName && (
              <div className="err">
                {errors.ownerFullName}
              </div>
            )}
          </div>

          <div className="field">
            <label>Username Owner</label>
            <input
              value={form.ownerUsername}
              onChange={upd("ownerUsername")}
            />
            {errors.ownerUsername && (
              <div className="err">
                {errors.ownerUsername}
              </div>
            )}
          </div>

          <div className="field">
            <label>Password Owner</label>
            <input
              type="password"
              value={form.ownerPassword}
              onChange={upd("ownerPassword")}
            />
            {errors.ownerPassword && (
              <div className="err">
                {errors.ownerPassword}
              </div>
            )}
          </div>
        </div>

        <h4 style={{ marginTop: 20 }}>
          Data Employee
        </h4>

        <div className="two-col">
          <div className="field">
            <label>Nama Employee</label>
            <input
              value={form.employeeFullName}
              onChange={upd("employeeFullName")}
            />
            {errors.employeeFullName && (
              <div className="err">
                {errors.employeeFullName}
              </div>
            )}
          </div>

          <div className="field">
            <label>Username Employee</label>
            <input
              value={form.employeeUsername}
              onChange={upd("employeeUsername")}
            />
            {errors.employeeUsername && (
              <div className="err">
                {errors.employeeUsername}
              </div>
            )}
          </div>

          <div className="field">
            <label>Password Employee</label>
            <input
              type="password"
              value={form.employeePassword}
              onChange={upd("employeePassword")}
            />
            {errors.employeePassword && (
              <div className="err">
                {errors.employeePassword}
              </div>
            )}
          </div>
        </div>

        <button
          className="btn-primary full"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading
            ? "Mendaftarkan..."
            : "Daftarkan Pegawai"}
        </button>

        <div className="auth-link">
          <button
            onClick={() => setPage("login")}
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}