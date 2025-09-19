// src/modules/users/UserModel.ts
export interface User {
  id: number;
  name: string;
  lastname: string | null;
  username: string;
  email: string;
  password: string;       // hash
  created_at: string;     // o Date si lo parseas
  updated_at: string;
}

export interface UserWithRoles extends User {
  roles: string[];
}
