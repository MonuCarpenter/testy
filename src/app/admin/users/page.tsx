"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

const TEMPLATE_CSV = `name,email,password,role,isActive\nAlice Admin,alice@example.com,Secret123,admin,true\nTom Teacher,tom@example.com,Secret123,teacher,true\nSara Student,sara@example.com,Secret123,student,true\n`;

type Role = "superadmin" | "admin" | "teacher" | "student";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};

const seed: UserRow[] = [];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [rows, setRows] = useState<UserRow[]>(seed);
  const [panelOpen, setPanelOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);

  // Update user modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateUserId, setUpdateUserId] = useState("");
  const [updateUserName, setUpdateUserName] = useState("");
  const [updateUserRole, setUpdateUserRole] = useState<Role>("student");
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("student");

  const filtered = useMemo(() => {
    const byRole = role === "all" ? rows : rows.filter((r) => r.role === role);
    const q = query.trim().toLowerCase();
    if (!q) return byRole;
    return byRole.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [rows, role, query]);

  const loadUsers = async () => {
    try {
      setLoadingTable(true);
      const url =
        role === "all" ? "/api/admin/users" : `/api/admin/users?role=${role}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      const mapped: UserRow[] = data.map((u: any) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive !== false,
      }));
      setRows(mapped);
      console.log(mapped);
    } catch (e) {
      setRows([]);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: newRole,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      await loadUsers();
      setPanelOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setNewRole("student");
    } catch (e) {
      // ignore for now
    } finally {
      setCreating(false);
    }
  };

  const openUpdateModal = (user: UserRow) => {
    setUpdateUserId(user.id);
    setUpdateUserName(user.name);
    setUpdateUserRole(user.role);
    setUpdateModalOpen(true);
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: updateUserId, role: updateUserRole }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) =>
          r.id === updateUserId ? { ...r, role: updateUserRole } : r
        )
      );
      setUpdateModalOpen(false);
      setUpdateUserId("");
      setUpdateUserName("");
      setUpdateUserRole("student");
    } catch (e) {
      // ignore for now
    } finally {
      setUpdating(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const user = rows.find((r) => r.id === id);
      if (!user) return;
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
      );
    } catch {}
  };

  const removeUser = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  // Bulk upload state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string>("");

  const uploadBulk = async () => {
    if (!bulkFile) return;
    setBulkLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", bulkFile);
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setBulkResult(`Inserted: ${data.inserted}, Skipped: ${data.skipped}`);
      await loadUsers();
    } catch (e: any) {
      setBulkResult(e.message || "Upload failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Users</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full md:w-80 px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role | "all")}
            className="px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <Button
            onClick={() => setPanelOpen((v) => !v)}
            className="font-semibold"
          >
            {panelOpen ? "Close" : "Create User"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setBulkOpen((v) => !v)}
            className="font-semibold"
          >
            {bulkOpen ? "Close Import" : "Bulk Import"}
          </Button>
        </div>
      </div>

      {bulkOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-card border border-border rounded-xl p-4 shadow">
          <div className="md:col-span-1 flex flex-col gap-2">
            <div className="text-sm font-medium">Download Template</div>
            <div className="text-xs text-muted-foreground">
              CSV format: name,email,password,role,isActive
            </div>
            <Button size="sm" className="w-fit mt-1" onClick={downloadTemplate}>
              Download CSV Template
            </Button>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <div className="text-sm font-medium">Upload CSV/XLSX</div>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="px-3 py-2 rounded-lg bg-input border border-border"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={uploadBulk}
                disabled={bulkLoading || !bulkFile}
              >
                {bulkLoading ? "Uploading..." : "Upload"}
              </Button>
              {bulkResult && (
                <div className="text-xs text-muted-foreground">
                  {bulkResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {panelOpen && (
        <form
          onSubmit={onCreate}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-card border border-border rounded-xl p-4 shadow"
        >
          <input
            required
            placeholder="Full name"
            className="px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            required
            placeholder="Email"
            type="email"
            className="px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            placeholder="Password"
            type="password"
            className="px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as Role)}
            className="px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <Button type="submit" disabled={creating} className="font-semibold">
            {creating ? (
              <span className="animate-pulse">Creating…</span>
            ) : (
              "Create"
            )}
          </Button>
        </form>
      )}

      {/* Update User Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Update User Role</h2>
            <form onSubmit={onUpdate} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User Name
                </label>
                <input
                  type="text"
                  value={updateUserName}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Select New Role
                </label>
                <select
                  value={updateUserRole}
                  onChange={(e) => setUpdateUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring outline-none mt-1"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setUpdateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <span className="animate-pulse">Updating…</span>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingTable ? (
              <tr>
                <td colSpan={5} className="px-4 py-8">
                  <Skeleton className="w-full h-10" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3 capitalize">{r.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.isActive
                          ? "text-green-600 font-medium"
                          : "text-zinc-500"
                      }
                    >
                      {r.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openUpdateModal(r)}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeUser(r.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Toaster />
    </div>
  );
}
