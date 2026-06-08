export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center">
        <img src="/logos/bu.png" alt="BU" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-slate mt-2">You do not have admin access.</p>
      </div>
    </div>
  );
}
