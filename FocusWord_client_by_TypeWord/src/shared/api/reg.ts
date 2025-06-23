import { z } from "zod";
import { API } from "./constants"
export const RegRequestSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().min(3, "Email cannot be empty"),
  password: z.string().min(3, "Password cannot be empty"),
  password2: z.string().min(3, "Password cannot be empty"),
}).refine((data) => data.password === data.password2, {
  message: "Password must be match",
  path: ["confirmPassword"],
});
export type RegRequest = z.infer<typeof RegRequestSchema>;

export const registration = async (data: RegRequest): Promise<void> => {
  // Валидация входных данных
  const parsed = RegRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/auth/registration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Error authorization" };
    }
    throw { response: { data: json } };
  }
};