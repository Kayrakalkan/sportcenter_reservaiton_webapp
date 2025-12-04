export enum UserRole {
  Admin = 'Admin',
  Faculty = 'Faculty'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface UserLogin {
  username: string;
  password: string;
}
