import Sidebar from "../../components/Sidebar";
import AuthGuard from "../../components/AuthGuard";
import { getUsers } from "../../lib/users";

type User = {
  id: number;
  name: string;
  email: string;
  role_id: number;
};

export default async function UsersPage() {
  const users = (await getUsers()) ?? [];

  return (
    <AuthGuard>
      <div
        style={{
          display: "flex",
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: "40px",
          }}
        >
          <h1>Users</h1>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Role ID</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </AuthGuard>
  );
}