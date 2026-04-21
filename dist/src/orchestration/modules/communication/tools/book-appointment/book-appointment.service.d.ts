import { z } from 'zod';
export declare class BookAppointmentService {
    private readonly bookAppointmentSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
