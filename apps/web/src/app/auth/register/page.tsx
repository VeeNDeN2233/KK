import { Suspense } from "react";
import { RegisterClient } from "./ui";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterClient />
    </Suspense>
  );
}

