"use client";

import { FormEvent, startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitFeedback } from "@/app/actions/submitFeedback";

const initialState = {
  message: "",
  isSuccess: false,
};

export const runtime = "edge";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="mt-2 rounded border border-solid border-transparent transition-colors flex items-center justify-center bg-[#4F2D7F] text-white gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    >
      Submit
    </button>
  );
}

export default function Home() {
  const [state, formAction] = useActionState(submitFeedback, initialState);

  if (state?.isSuccess) {
    return (
      <div className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-2xl">Success!</h1>
        <p>Thank you for your feedback!</p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    startTransition(() => formAction(formData));
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <img src="./BYXxSMU.png" className="w-[15rem]" alt=""></img>
        <h1 className="text-3xl">Submit Feedback</h1>
        <form onSubmit={handleSubmit}>
          <p>What is our abbreviated secret phrase?*</p>
          <input
            type="text"
            id="secretPhrase"
            name="secretPhrase"
            required
            className="rounded w-[100%] border border-black dark:bg-slate-600 p-2"
          />
          <p className="mt-1">Feedback*</p>
          <textarea
            id="feedback"
            name="feedback"
            required
            className="rounded w-[100%] border border-black dark:bg-slate-600 p-2"
            rows={4}
          ></textarea>
          <p>Name (Optional)</p>
          <input
            type="text"
            id="name"
            name="name"
            className="rounded w-[100%] border border-black dark:bg-slate-600 p-2"
          />
          <SubmitButton />
          <p role="status">{state?.message}</p>
        </form>
      </main>
    </div>
  );
}
