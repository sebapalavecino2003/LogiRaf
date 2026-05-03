import { useState, useEffect, type FormEvent } from "react";
import AppLayout from "@/components/AppLayout";
import { getUsuarios, createUsuario } from "@/api/usuarios";
import { AlertCircle, Check, UserPlus } from "lucide-react";

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsuarios()
      .then((res) => setUsuarios(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Administración de Usuarios</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" /> Nuevo Usuario
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {showForm && <CreateUserForm onCreated={() => { setShowForm(false); fetchUsers(); }} />}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay usuarios</td></tr>
                ) : (
                  usuarios.map((u: any) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-card-foreground">{u.username}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {u.rol?.nombre_rol || u.role || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", rol: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createUsuario(form);
      setSuccess(true);
      setTimeout(() => onCreated(), 1000);
    } catch (e: any) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <Check className="h-4 w-4" /> Usuario creado
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Usuario" required
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" type="password" required
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <input value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} placeholder="Rol (ej: ADMIN)"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <button type="submit" disabled={submitting}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : "Crear Usuario"}
      </button>
    </form>
  );
}
