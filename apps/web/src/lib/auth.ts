export async function login(
  username: string,
  password: string
) {
  const formData = new URLSearchParams();

  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(
    "http://127.0.0.1:8000/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }
  );

  if (!response.ok) {
    throw new Error("Login inválido");
  }

  return response.json();
}