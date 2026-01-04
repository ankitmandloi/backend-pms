import type { HousekeepingStatus, HousekeepingTaskRecord, MaintenanceRecord, MaintenancePriority, RoomRecord } from "../types/domain.js";
export type HousekeepingRoomPayload = {
    room: RoomRecord;
    task: HousekeepingTaskRecord;
};
export declare const listHousekeepingRooms: (hotelCode: string) => Promise<HousekeepingRoomPayload[]>;
export type AssignHousekeepingInput = {
    roomId: string;
    assignedTo: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    notes?: string;
};
export declare const assignHousekeepingTask: (input: AssignHousekeepingInput) => Promise<HousekeepingTaskRecord>;
export type UpdateHousekeepingStatusInput = {
    roomId: string;
    status: HousekeepingStatus;
    notes?: string;
};
export declare const updateHousekeepingStatus: (input: UpdateHousekeepingStatusInput) => Promise<HousekeepingTaskRecord>;
export type MaintenanceInput = {
    roomId: string;
    title: string;
    description?: string;
    priority: MaintenancePriority;
    reportedBy?: string;
};
export declare const createMaintenanceRequest: (input: MaintenanceInput) => Promise<MaintenanceRecord>;
