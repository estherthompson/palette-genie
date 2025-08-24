import React, { useState } from "react";
import { emailValidator, nameValidator, passwordValidator } from "@/core/utils";
import TextInput from "../pages/text_input";
import { useRouter } from "next/router";
import Image from "next/image";

export default function SignUp() {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [username, setUsername] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const _onSignUpPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    const usernameError = nameValidator(username.value);

    if (emailError || passwordError || usernameError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      setUsername({ ...username, error: usernameError });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          username: username.value,
          password: password.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Store the token
      localStorage.setItem('token', data.token);
      
      // Redirect to home page
      router.push('/home');
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
      setEmail({ ...email, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fef6e9] min-h-screen flex flex-col items-center justify-center px-4">
      <button
        onClick={() => router.push('/home')}
        className="flex items-center gap-1 text-[#442418]  hover:underline 
                 h-10 w-25 bg-[#ffff] mr-150 rounded-3xl border border-[#3a1c16] border-solid 
                 shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-md hover:shadow-[#fad27f]"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 ml-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <span className="font-medium mr-1">Back</span>
      </button>
      <Image
        className="w-40 md:w-56 lg:w-64 mb-6"
        src="/images/palette-genie.png"
        alt="Palette Genie"
        width={256}
        height={256}
      />

      {/* Form container */}
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center text-[#55423d]">Sign Up</h2>

        <TextInput
          label="Username"
          returnKeyType="next"
          value={username.value}
          onChangeText={(text) => setUsername({ value: text, error: "" })}
          error={!!username.error}
          errorText={username.error}
          autoCapitalize="none"
        />

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
          onClick={_onSignUpPressed}
          disabled={loading}
          className={`mt-4 w-full bg-[#ffc6ac] hover:bg-[#faae7b] text-[#55423d] font-semibold py-2 rounded-full transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
