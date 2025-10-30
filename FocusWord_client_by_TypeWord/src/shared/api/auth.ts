import { z } from "zod";
import { API } from "./constants"
export const loginRequestSchema = z.object({
  email: z.string().min(3, "Email cannot be empty"),
  password: z.string().min(3, "Пароль cannot be empty"),
  remember: z.boolean().optional(),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const login = async (data: LoginRequest): Promise<void> => {
  // Валидация входных данных
  const parsed = loginRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }
  const response = await fetch(`${API}/api/auth/login`, {
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