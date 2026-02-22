export interface Authorization {
    id: number;
    userId: number;
    serviceName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
    updatedAt: Date;
}
