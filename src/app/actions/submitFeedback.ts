"use server";

import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'
import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

export async function submitFeedback(
  prevState: {
    message: string;
    isSuccess: boolean;
  },
  formData: FormData
) {
    // Parse form data and validate it using Zod schema
  const schema = z.object({
    secretPhrase: z.string().min(1),
    name: z.string().optional(),
    feedback: z.string().min(1),
    cfturnstileresponse: z.any(),
  });

  const parse = schema.safeParse({
    secretPhrase: formData.get("secretPhrase"),
    name: formData.get("name"),
    feedback: formData.get("feedback"),
    cfturnstileresponse: formData.get("cf-turnstile-response"),
  });


  if (!parse.success) {
    return { message: "Failed to parse form", isSuccess: false };
  }

  const data = parse.data;

  // Verify turnstile verification
  const turnstileSecret = getRequestContext().env.TURNSTILE_SECRET_KEY;
  const turnstileVerifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  const res = await fetch(turnstileVerifyEndpoint, {
    method: 'POST',
    body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(data.cfturnstileresponse)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })

  const turnstileData = (await res.json()) as TurnstileServerValidationResponse

  if(!turnstileData.success) {
    console.log("turnstile action", turnstileData.action)
    console.log("turnstile Success", turnstileData.success)
    console.log("turnstile meta", turnstileData.metadata)
    console.log("turnstile messages", turnstileData.messages)
    console.log("turnstile error", turnstileData['error-codes'])


    return { message: "Failed to verify turnstile", isSuccess: false };
  }

  // Queue email for sending
  try {
    await getRequestContext().env.EMAIL_QUEUE.send({
      To: ["contact@smubyx.org"],
      Subject: "New Feedback Submitted",
      Message: `Feedback: ${data.feedback}\nName: ${
        data.name || "N/A"
      }\nSecret Phrase: ${data.secretPhrase}`,
    });

    console.log("Email added to queue successfully");

    return { message: `Form Submitted`, isSuccess: true }; // TODO: Redirect to success page
  } catch (error) {
    console.error("Failed to add email to queue:", error);
    return { message: "Failed to send email", isSuccess: false };
  }
}
