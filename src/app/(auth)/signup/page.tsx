import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up — LOL-65B",
};

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-6 text-center font-mono text-lg font-semibold text-zinc-100">
        Create Account
      </h2>
      <SignupForm />
    </>
  );
}
