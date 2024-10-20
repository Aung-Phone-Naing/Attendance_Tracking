import { 
    integer,
    pgEnum,
    pgTable, 
    serial,
    date, 
    uuid,
    varchar,
    timestamp
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { events } from "./events.schema";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statusEnum = pgEnum(
    'attendance_status',
    ['In', 'Out']
);

export const attendance = pgTable('attendance', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    eventId: integer('event_id').references(() => events.id),                               // Nullable for daily attendance
    attendanceDate: date('attendance_date').notNull(),
    status: varchar('status', { length: 100 }).notNull(),                                   //  'Present' or 'Absent'
    reason: varchar('reason'),
    verifiedBy: varchar('verified_by').notNull(),
    remarks: varchar('remarks'),
    checkInTime: timestamp('check_in_time', { mode: 'string' }),
    checkOutTime: timestamp('check_out_time', { mode: 'string' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendanceRelations = relations(attendance, ({ one, many }) => ({
    users: one(users, {
        fields: [attendance.userId],
        references: [users.id]
    }),
    events: one(events, {
        fields: [attendance.eventId],
        references: [events.id]
    })
}));

export const attendanceSchema = createInsertSchema(attendance, {
    userId: (schema) =>
        schema.userId.min(1, { message: "UserId must be provided!" }),
    attendanceDate: (schema) =>
        schema.attendanceDate.min(1, { message: "Attendance Date must be provided!" }),
    status: (schema) =>
        schema.status.min(2, { message: "Status must be provided!" }),
    verifiedBy: (schema) =>
        schema.verifiedBy.min(4, { message: "VerifiedBy must be provided!" }),
}).pick({
    id: true,
    userId: true,
    eventId: true,
    attendanceDate: true,
    status: true,
    reason: true,
    remarks: true,
    verifiedBy: true,
    checkInTime: true,
    checkOutTime: true
});
export type AttendanceSchema = z.infer<typeof attendanceSchema>