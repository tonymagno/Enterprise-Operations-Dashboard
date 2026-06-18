export async function getUsers() {
  const response = await fetch(
    "http://127.0.0.1:8000/users?page=1&limit=20",
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgxNjUyMjExfQ.1aRM-oRgnTf60TsqxSWE88OJs0nRtFWvJrS7QPmrEIU`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar usuários: ${response.status}`
    );
  }

  return response.json();
}