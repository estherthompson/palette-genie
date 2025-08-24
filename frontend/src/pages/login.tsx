import React, { useState } from "react";
import { emailValidator, passwordValidator } from "@/core/utils";
import TextInput from "../pages/text_input";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const _onLoginPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
  
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
  
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setEmail({ ...email, error: data.message || 'Invalid email or password' });
        return;
      }
  
      // Save token if successful
      localStorage.setItem('token', data.token);
  
      // Redirect to dashboard or home
      router.push('/home');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setEmail({ ...email, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Palette Genie</title>
      </Head>
      <main className="bg-[#fef6e9] min-h-screen flex flex-col items-center justify-center px-4">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1 text-[#442418] hover:underline 
                   h-10 w-25 bg-[#ffff] mr-150 lg:h-12 lg:w-32 rounded-3xl border border-[#3a1c16] border-solid 
                   shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-md hover:shadow-[#fad27f]"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 ml-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          <span className="font-medium text-sm lg:text-base xl:text-lg">Back</span>
        </button>
        <Image
          className="w-40 md:w-56 lg:w-64 mb-6"
          src="/images/palette-genie.png"
          alt="Palette Genie"
          width={256}
          height={256}
        />

        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-sm relative">
          <h2 className="text-2xl font-semibold mb-4 text-center text-[#55423d]">Login</h2>

          <TextInput
            label="Email"
            returnKeyType="next"
            value={email.value}
            onChangeText={(text) => setEmail({ value: text, error: "" })}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            type="email"
          />

          <TextInput
            label="Password"
            returnKeyType="done"
            value={password.value}
            onChangeText={(text) => setPassword({ value: text, error: "" })}
            error={!!password.error}
            errorText={password.error}
            type="password"
          />

          <button
            onClick={_onLoginPressed}
            disabled={loading}
            className={`mt-4 w-full bg-[#ffc6ac] hover:bg-[#faae7b] text-[#55423d] font-semibold py-2 rounded-full transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </main>
    </>
  );
}
