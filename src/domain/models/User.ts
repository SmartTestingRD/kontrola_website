export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string; // From the DB
    consorcioId: number;
    forcePasswordChange: boolean;
}
