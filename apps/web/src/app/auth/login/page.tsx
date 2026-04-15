import { Suspense } from "react";
import { LoginClient } from "./ui";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}

