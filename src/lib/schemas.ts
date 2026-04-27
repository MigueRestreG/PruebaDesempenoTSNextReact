import { z } from "zod";

export const busSchema = z.object({
  placa: z
    .string()
    .min(3, "La placa debe tener al menos 3 caracteres")
    .max(255, "La placa no puede exceder 255 caracteres")
    .transform((value) => value.trim().toUpperCase()),
  modelo: z.string().min(2, "El modelo es obligatorio").max(60),
  capacidad: z.coerce
    .number()
    .int("La capacidad debe ser un entero")
    .min(1, "La capacidad debe ser mayor que cero")
    .max(200, "La capacidad no puede ser mayor a 200"),
  descripcion: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional().nullable(),
  tarifa: z.coerce.number().positive("La tarifa debe ser mayor a 0"),
  isActive: z.boolean().default(true),
});

export const driverSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio").max(255),
  licencia: z
    .string()
    .min(6, "La licencia debe tener al menos 6 caracteres")
    .max(255)
    .transform((value) => value.trim().toUpperCase()),
  telefono: z
    .string()
    .min(7, "El telefono debe tener al menos 7 caracteres")
    .max(20),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La clave debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(90, "El nombre no puede exceder 90 caracteres"),
    email: z.string().email("Email invalido"),
    username: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(30, "El usuario no puede exceder 30 caracteres")
      .transform((value) => value.trim().toLowerCase()),
    password: z
      .string()
      .min(6, "La clave debe tener al menos 6 caracteres")
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las claves no coinciden",
    path: ["confirmPassword"],
  });

/** Parámetros de query string para listados con paginación */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});
