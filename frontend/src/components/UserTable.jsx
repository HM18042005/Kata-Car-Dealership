function Row({ user, currentUserId, onPromote, onDemote, onDelete }) {
  const isSelf = user.id === currentUserId;
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td className="p-4 text-slate-900 font-medium">{user.email}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${user.role === "admin" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
          {user.role}
        </span>
      </td>
      <td className="p-4">
        {isSelf ? (
          <span className="text-xs text-slate-400 italic">This is you</span>
        ) : (
          <div className="flex items-center gap-2">
            {user.role === "admin" ? (
              <button type="button" onClick={() => onDemote(user.id)} className="text-teal-600 hover:text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors text-sm font-semibold">
                Demote
              </button>
            ) : (
              <button type="button" onClick={() => onPromote(user.id)} className="text-teal-600 hover:text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors text-sm font-semibold">
                Promote
              </button>
            )}
            <button type="button" onClick={() => onDelete(user.id)} aria-label="Delete" className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
              <img src="/svgs/trash.svg" alt="" aria-hidden="true" className="w-4 h-4" style={{ filter: "invert(20%) sepia(90%) saturate(3000%) hue-rotate(350deg)" }} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function UserTable({ users, currentUserId, onPromote, onDemote, onDelete, emptyMessage = "No users found." }) {
  if (users.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center gap-4">
        <img src="/svgs/user.svg" alt="" aria-hidden="true" className="w-12 h-12 opacity-20" />
        <span className="text-lg">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 font-semibold text-slate-700">Email</th>
            <th className="p-4 font-semibold text-slate-700">Role</th>
            <th className="p-4 font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <Row key={u.id} user={u} currentUserId={currentUserId} onPromote={onPromote} onDemote={onDemote} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
