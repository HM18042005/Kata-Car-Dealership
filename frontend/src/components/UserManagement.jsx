import UserTable from "./UserTable";
import Spinner from "./Spinner";
import { useApi } from "../hooks/useApi";

export default function UserManagement({ currentUserId, setToast }) {
  const { data: users, loading, error, execute: fetchUsers } = useApi("/api/users", { auto: true });
  const { execute: promoteUser } = useApi("/api/users", { method: "POST" });
  const { execute: demoteUser } = useApi("/api/users", { method: "POST" });
  const { execute: deleteUserApi } = useApi("/api/users", { method: "DELETE" });

  const handlePromote = async (id) => {
    try {
      await promoteUser({ path: `/api/users/${id}/promote` });
      setToast({ type: "success", message: "User promoted to admin." });
      fetchUsers().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to promote user." });
    }
  };

  const handleDemote = async (id) => {
    try {
      await demoteUser({ path: `/api/users/${id}/demote` });
      setToast({ type: "success", message: "User demoted to regular user." });
      fetchUsers().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to demote user." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserApi({ path: `/api/users/${id}` });
      setToast({ type: "success", message: "User deleted." });
      fetchUsers().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete user." });
    }
  };

  return (
    <section aria-label="User management">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">{error}</div>}

      {loading && !users ? (
        <Spinner />
      ) : (
        <UserTable
          users={users || []}
          currentUserId={currentUserId}
          onPromote={handlePromote}
          onDemote={handleDemote}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
