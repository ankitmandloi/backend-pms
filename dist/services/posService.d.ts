import type { KitchenTicketRecord, MenuItemRecord, OrderRecord, OrderStatus } from "../types/domain.js";
export type MenuItemInput = {
    hotelId: string;
    hotelCode: string;
    name: string;
    category: string;
    price: number;
    isAvailable?: boolean;
};
export type UpdateMenuItemInput = Partial<Omit<MenuItemInput, "hotelId" | "hotelCode" | "name">> & {
    name?: string;
};
export declare const listMenuItems: (hotelCode: string) => Promise<MenuItemRecord[]>;
export declare const createMenuItem: (input: MenuItemInput) => Promise<MenuItemRecord>;
export declare const updateMenuItem: (id: string, input: UpdateMenuItemInput) => Promise<MenuItemRecord>;
export declare const deleteMenuItem: (id: string) => Promise<void>;
export type OrderItemInput = {
    menuItemId: string;
    quantity: number;
    notes?: string;
};
export type CreateOrderInput = {
    hotelId: string;
    hotelCode: string;
    source: OrderRecord["source"];
    tableId?: string;
    reservationId?: string;
    guestName?: string;
    items: OrderItemInput[];
};
export declare const createOrder: (input: CreateOrderInput) => Promise<OrderRecord>;
export declare const listOrders: (hotelCode: string) => Promise<OrderRecord[]>;
export type UpdateOrderStatusInput = {
    orderId: string;
    status: OrderStatus;
};
export declare const updateOrderStatus: (input: UpdateOrderStatusInput) => Promise<OrderRecord>;
export type RoomPostingInput = {
    orderId: string;
    reservationId: string;
    folioId?: string;
    folioName?: string;
};
export declare const postOrderToRoom: (input: RoomPostingInput) => Promise<OrderRecord>;
export declare const getKotQueue: (hotelCode: string) => Promise<KitchenTicketRecord[]>;
