"use client";

import { useEffect } from "react";

export function useAuth() {
  useEffect(() => {
    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      window.location.href =
        "/login";
    }
  }, []);
}