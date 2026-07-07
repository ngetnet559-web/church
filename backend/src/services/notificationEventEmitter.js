import { EventEmitter } from "events";

const notificationEmitter = new EventEmitter();

notificationEmitter.setMaxListeners(100);

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_CREATED: "notification:created",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_ALL: "notification:readAll",
  NOTIFICATION_DELETED: "notification:deleted",
  BULK_NOTIFICATION: "notification:bulk",
};

export default notificationEmitter;
