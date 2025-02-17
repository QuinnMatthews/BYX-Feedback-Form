"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

export async function submitFeedback(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  const schema = z.object({
    secretPhrase: z.string().min(1),
    name: z.string().optional(),
    feedback: z.string().min(1),
  });
  const parse = schema.safeParse({
    secretPhrase: formData.get("secretPhrase"),
    name: formData.get("name"),
    feedback: formData.get("feedback"),
  });

  if (!parse.success) {
    return { message: "Failed to parse form" };
  }

  const data = parse.data;

  try {
    await getRequestContext().env.EMAIL_QUEUE.send({
      To: ["contact@smubyx.org"], // TODO: Use env variable
      Subject: "New Feedback Submitted",
      Message: `Feedback: ${data.feedback}\nName: ${
        data.name || "N/A"
      }\nSecret Phrase: ${data.secretPhrase}`,
    });

    console.log("Email added to queue successfully");

    return { message: `Form Submitted` }; // TODO: Redirect to success page
  } catch (error) {
    console.error("Failed to add email to queue:", error);
    return { message: "Failed to send email" };
  }
}
