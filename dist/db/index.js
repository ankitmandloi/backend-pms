import { createJsonTable } from "./jsonTable.js";
const users = createJsonTable("users");
const rooms = createJsonTable("rooms");
const reservations = createJsonTable("reservations");
const shifts = createJsonTable("shifts");
const property = createJsonTable("property");
const roomTypes = createJsonTable("roomTypes");
const floors = createJsonTable("floors");
const taxes = createJsonTable("taxes");
const guests = createJsonTable("guests");
const bills = createJsonTable("bills");
const payments = createJsonTable("payments");
const housekeeping = createJsonTable("housekeeping");
const maintenance = createJsonTable("maintenance");
const menu = createJsonTable("menu");
const orders = createJsonTable("orders");
const kitchenTickets = createJsonTable("kots");
const alerts = createJsonTable("alerts");
// New feature tables
const nightAudits = createJsonTable("nightAudits");
const otaChannels = createJsonTable("otaChannels");
const otaReservationImports = createJsonTable("otaReservationImports");
const otaSyncLogs = createJsonTable("otaSyncLogs");
const whatsappTemplates = createJsonTable("whatsappTemplates");
const whatsappMessages = createJsonTable("whatsappMessages");
const whatsappConfig = createJsonTable("whatsappConfig");
const propertyGroups = createJsonTable("propertyGroups");
const transactionLogs = createJsonTable("transactionLogs");
export const db = {
    users,
    rooms,
    reservations,
    shifts,
    property,
    roomTypes,
    floors,
    taxes,
    guests,
    bills,
    payments,
    housekeeping,
    maintenance,
    menu,
    orders,
    kitchenTickets,
    alerts,
    // New feature tables
    nightAudits,
    otaChannels,
    otaReservationImports,
    otaSyncLogs,
    whatsappTemplates,
    whatsappMessages,
    whatsappConfig,
    propertyGroups,
    transactionLogs
};
export const getTable = (name) => db[name];
//# sourceMappingURL=index.js.map