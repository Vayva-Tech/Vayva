export var Role;
(function (Role) {
    Role["OWNER"] = "OWNER";
    Role["ADMIN"] = "ADMIN";
    Role["STAFF"] = "STAFF";
    Role["OPS_ADMIN"] = "OPS_ADMIN";
    Role["OPS_AGENT"] = "OPS_AGENT";
})(Role || (Role = {}));
export var OrderPaymentStatus;
(function (OrderPaymentStatus) {
    OrderPaymentStatus["PENDING"] = "PENDING";
    OrderPaymentStatus["VERIFIED"] = "VERIFIED";
    OrderPaymentStatus["FAILED"] = "FAILED";
    OrderPaymentStatus["REFUNDED"] = "REFUNDED";
    OrderPaymentStatus["DISPUTED"] = "DISPUTED";
})(OrderPaymentStatus || (OrderPaymentStatus = {}));
export var OrderFulfillmentStatus;
(function (OrderFulfillmentStatus) {
    OrderFulfillmentStatus["PROCESSING"] = "PROCESSING";
    OrderFulfillmentStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderFulfillmentStatus["DELIVERED"] = "DELIVERED";
    OrderFulfillmentStatus["CANCELLED"] = "CANCELLED";
})(OrderFulfillmentStatus || (OrderFulfillmentStatus = {}));
export var ApprovalType;
(function (ApprovalType) {
    ApprovalType["DELIVERY_SCHEDULE"] = "DELIVERY_SCHEDULE";
    ApprovalType["DISCOUNT"] = "DISCOUNT";
    ApprovalType["REFUND"] = "REFUND";
    ApprovalType["STATUS_CHANGE"] = "STATUS_CHANGE";
})(ApprovalType || (ApprovalType = {}));
export var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["EXPIRED"] = "EXPIRED";
})(ApprovalStatus || (ApprovalStatus = {}));
export var DeliveryTaskStatus;
(function (DeliveryTaskStatus) {
    DeliveryTaskStatus["SCHEDULED"] = "SCHEDULED";
    DeliveryTaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    DeliveryTaskStatus["DELIVERED"] = "DELIVERED";
    DeliveryTaskStatus["FAILED"] = "FAILED";
    DeliveryTaskStatus["CANCELLED"] = "CANCELLED";
})(DeliveryTaskStatus || (DeliveryTaskStatus = {}));
export var ListingStatus;
(function (ListingStatus) {
    ListingStatus["UNLISTED"] = "UNLISTED";
    ListingStatus["LISTED"] = "LISTED";
    ListingStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    ListingStatus["REJECTED"] = "REJECTED";
})(ListingStatus || (ListingStatus = {}));
export var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["OPEN"] = "OPEN";
    ConversationStatus["ESCALATED"] = "ESCALATED";
    ConversationStatus["RESOLVED"] = "RESOLVED";
})(ConversationStatus || (ConversationStatus = {}));
export var Channel;
(function (Channel) {
    Channel["STOREFRONT"] = "STOREFRONT";
    Channel["MARKETPLACE"] = "MARKETPLACE";
    Channel["WHATSAPP_AI"] = "WHATSAPP_AI";
})(Channel || (Channel = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER"] = "ORDER";
    NotificationType["APPROVAL"] = "APPROVAL";
    NotificationType["PAYMENT"] = "PAYMENT";
    NotificationType["PAYOUT"] = "PAYOUT";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (NotificationType = {}));
