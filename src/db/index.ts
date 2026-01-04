import { createJsonTable, JsonTable } from "./jsonTable.js";
import type {
  FloorRecord,
  BillRecord,
  PaymentRecord,
  HousekeepingTaskRecord,
  MaintenanceRecord,
  MenuItemRecord,
  OrderRecord,
  KitchenTicketRecord,
  AlertRecord,
  GuestRecord,
  PropertyProfile,
  ReservationRecord,
  RoomRecord,
  RoomTypeRecord,
  ShiftRecord,
  TaxConfig,
  UserRecord,
  NightAuditRecord,
  OTAChannelConfig,
  OTAReservationImport,
  OTASyncLog,
  WhatsAppTemplate,
  WhatsAppMessage,
  WhatsAppConfig,
  PropertyGroup,
  TransactionLogRecord
} from "../types/domain.js";

export type { JsonTable } from "./jsonTable.js";

const users = createJsonTable<UserRecord>("users");
const rooms = createJsonTable<RoomRecord>("rooms");
const reservations = createJsonTable<ReservationRecord>("reservations");
const shifts = createJsonTable<ShiftRecord>("shifts");
const property = createJsonTable<PropertyProfile>("property");
const roomTypes = createJsonTable<RoomTypeRecord>("roomTypes");
const floors = createJsonTable<FloorRecord>("floors");
const taxes = createJsonTable<TaxConfig>("taxes");
const guests = createJsonTable<GuestRecord>("guests");
const bills = createJsonTable<BillRecord>("bills");
const payments = createJsonTable<PaymentRecord>("payments");
const housekeeping = createJsonTable<HousekeepingTaskRecord>("housekeeping");
const maintenance = createJsonTable<MaintenanceRecord>("maintenance");
const menu = createJsonTable<MenuItemRecord>("menu");
const orders = createJsonTable<OrderRecord>("orders");
const kitchenTickets = createJsonTable<KitchenTicketRecord>("kots");
const alerts = createJsonTable<AlertRecord>("alerts");

// New feature tables
const nightAudits = createJsonTable<NightAuditRecord>("nightAudits");
const otaChannels = createJsonTable<OTAChannelConfig>("otaChannels");
const otaReservationImports = createJsonTable<OTAReservationImport>("otaReservationImports");
const otaSyncLogs = createJsonTable<OTASyncLog>("otaSyncLogs");
const whatsappTemplates = createJsonTable<WhatsAppTemplate>("whatsappTemplates");
const whatsappMessages = createJsonTable<WhatsAppMessage>("whatsappMessages");
const whatsappConfig = createJsonTable<WhatsAppConfig>("whatsappConfig");
const propertyGroups = createJsonTable<PropertyGroup>("propertyGroups");
const transactionLogs = createJsonTable<TransactionLogRecord>("transactionLogs");

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

export type Database = typeof db;

export type TableName = keyof Database;

export const getTable = <K extends TableName>(name: K): Database[K] => db[name];
