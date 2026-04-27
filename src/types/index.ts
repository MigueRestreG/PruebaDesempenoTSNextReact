export type BusStatus = "activo" | "inactivo";
export type UserRole = "admin" | "usuario";

export interface Bus {
  id: string;
  placa: string;
  modelo: string;
  capacidad: number;
  descripcion: string | null;
  tarifa: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  nombre: string;
  licencia: string;
  telefono: string;
  busId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverWithBus extends Driver {
  bus: { placa: string } | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  nombre: string;
  role: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  username: string;
  nombre: string;
  role: UserRole;
  type: "access" | "refresh";
  jti?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
