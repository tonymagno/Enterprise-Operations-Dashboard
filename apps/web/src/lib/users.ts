export async function getUsers() {
  const token = localStorage.getItem("access_token");

  console.log("TOKEN:", token);

  if (!token) {
    throw new Error("Usuário não autenticado");
  }

  const response = await fetch(
    "http://127.0.0.1:8000/users?page=1&limit=20",
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("STATUS:", response.status);

  const data = await response.json();

  console.log("DADOS API:", data);

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar usuários: ${response.status}`
    );
  }

  return data;
}