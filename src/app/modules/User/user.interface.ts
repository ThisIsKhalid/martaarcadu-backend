export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole.USER;
  isAgreedToTermsCondition: boolean;
}
