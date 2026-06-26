"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    validateToken();
  }, []);

  async function validateToken() {
    try {
      const accessToken =
        localStorage.getItem("access_token");

      const refreshToken =
        localStorage.getItem("refresh_token");

      if (!accessToken) {
        logout();
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/auth/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Token válido
      if (response.ok) {
        return;
      }

      // Token expirado
      if (
        response.status === 401 &&
        refreshToken
      ) {
        await refreshAccessToken(
          refreshToken
        );
        return;
      }

      logout();
    } catch (error) {
      console.error(
        "Erro ao validar autenticação:",
        error
      );

      logout();
    }
  }

  async function refreshAccessToken(
    refreshToken: string
  ) {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Falha ao renovar token"
        );
      }

      const data = await response.json();

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      if (data.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          data.refresh_token
        );
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "Erro ao renovar token:",
        error
      );

      logout();
    }
  }

  function logout() {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    router.push("/login");
  }
}