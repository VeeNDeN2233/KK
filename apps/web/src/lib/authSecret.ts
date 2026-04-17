export function getAuthSecret() {
  return (
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development" ? "ck-dev-secret-change-me" : undefined)
  );
}

