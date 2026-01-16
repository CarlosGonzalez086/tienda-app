export interface LoginResponse {
  codigo: string;
  mensaje: string;
  respuesta?: {
    token?: string;
  };
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}
