export default function Header({ user, onLogout, onLoginClick }) {
  return (
    <header className="h-[70px] px-6 bg-[#0b0f19] flex justify-between items-center border-b border-slate-800/80 shrink-0 z-20">
      <div className="text-xl font-extrabold text-white flex items-center gap-3 tracking-tight">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          ✦
        </div>
        OpsMind AI 👾
      </div>

      <div className="flex gap-4 items-center">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-emerald-400 border border-slate-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden md:block">
                {user.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
