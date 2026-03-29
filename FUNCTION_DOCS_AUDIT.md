# Function Documentation Audit Report

Total services files: 123
Files with undocumented functions: 121
Total undocumented functions: 1170

## Backend/fastify-server/src/services/admin/admin-system.service.ts

- Line 196: `if()`

## Backend/fastify-server/src/services/admin/merchant-admin.service.ts

- Line 24: `if()`
- Line 166: `if()`
- Line 257: `if()`
- Line 297: `if()`
- Line 301: `if()`
- Line 326: `if()`
- Line 330: `if()`
- Line 354: `if()`
- Line 375: `if()`
- Line 396: `if()`
- Line 418: `if()`
- Line 435: `if()`
- Line 469: `if()`
- Line 495: `if()`

## Backend/fastify-server/src/services/ai/ai.service.ts

- Line 7: `getCreditSummary()`
- Line 14: `if()`
- Line 42: `checkLowCreditAlert()`
- Line 50: `getTemplates()`
- Line 67: `createTemplate()`
- Line 70: `if()`
- Line 249: `getInsights()`
- Line 303: `if()`
- Line 343: `getWhatsAppStatus()`
- Line 350: `if()`
- Line 375: `getAnalytics()`
- Line 408: `for()`
- Line 433: `getAvailablePackages()`
- Line 462: `initializeCreditTopup()`
- Line 470: `if()`
- Line 480: `if()`
- Line 509: `topupCredits()`
- Line 521: `verifyCreditTopup()`
- Line 533: `if()`
- Line 551: `if()`
- Line 560: `if()`
- Line 579: `chat()`
- Line 581: `if()`
- Line 587: `if()`
- Line 602: `if()`
- Line 614: `whatsappWebhook()`
- Line 619: `if()`
- Line 629: `if()`
- Line 641: `getConversations()`
- Line 650: `if()`
- Line 654: `if()`
- Line 689: `getAnalytics()`
- Line 718: `getHealthStatus()`
- Line 730: `saveConversation()`
- Line 760: `if()`
- Line 766: `sendWhatsAppResponse()`

## Backend/fastify-server/src/services/ai/aiAgent.service.ts

- Line 7: `getProfile()`
- Line 43: `updateProfile()`
- Line 76: `publishProfile()`
- Line 91: `if()`
- Line 122: `testMessage()`

## Backend/fastify-server/src/services/ai/automation.service.ts

- Line 7: `getRules()`
- Line 33: `createRule()`
- Line 36: `if()`
- Line 92: `updateRule()`
- Line 98: `if()`
- Line 118: `deleteRule()`
- Line 124: `if()`
- Line 140: `toggleRule()`
- Line 146: `if()`
- Line 167: `executeRule()`
- Line 173: `if()`
- Line 179: `switch()`
- Line 211: `executeSendEmail()`
- Line 217: `executeSendWhatsApp()`
- Line 223: `executeApplyDiscount()`
- Line 229: `executeAddToSegment()`
- Line 235: `executeUpdateOrderStatus()`
- Line 241: `executeTriggerWebhook()`

## Backend/fastify-server/src/services/ai/autopilot.service.ts

- Line 97: `for()`
- Line 113: `if()`
- Line 118: `if()`
- Line 148: `evaluateAutopilot()`
- Line 162: `if()`
- Line 169: `if()`
- Line 186: `for()`
- Line 199: `if()`
- Line 223: `for()`
- Line 264: `gatherBusinessSnapshot()`
- Line 488: `callOpenRouterAutopilot()`
- Line 490: `if()`
- Line 514: `for()`
- Line 530: `if()`
- Line 540: `if()`

## Backend/fastify-server/src/services/analytics/event-ingestion.service.ts

- Line 7: `ingestEvent()`
- Line 39: `if()`
- Line 47: `if()`
- Line 63: `getEvents()`
- Line 72: `if()`
- Line 76: `if()`
- Line 78: `if()`
- Line 81: `if()`
- Line 86: `if()`
- Line 99: `getEventStats()`
- Line 120: `if()`

## Backend/fastify-server/src/services/auth.ts

- Line 23: `if()`
- Line 29: `if()`
- Line 39: `if()`
- Line 43: `if()`
- Line 50: `if()`
- Line 60: `if()`
- Line 68: `if()`
- Line 73: `if()`

## Backend/fastify-server/src/services/commerce/cart.service.ts

- Line 31: `if()`
- Line 63: `if()`
- Line 78: `if()`
- Line 94: `if()`
- Line 148: `if()`
- Line 154: `if()`
- Line 159: `if()`
- Line 164: `if()`
- Line 186: `if()`
- Line 204: `if()`
- Line 222: `if()`
- Line 234: `if()`
- Line 239: `if()`
- Line 261: `if()`
- Line 295: `if()`
- Line 301: `if()`
- Line 305: `if()`
- Line 309: `if()`
- Line 328: `if()`
- Line 375: `if()`
- Line 393: `if()`

## Backend/fastify-server/src/services/commerce/checkout.service.ts

- Line 29: `if()`
- Line 33: `if()`
- Line 39: `if()`
- Line 98: `if()`
- Line 128: `if()`
- Line 132: `if()`
- Line 137: `if()`
- Line 188: `if()`
- Line 192: `if()`
- Line 251: `if()`
- Line 255: `if()`
- Line 293: `if()`
- Line 331: `for()`
- Line 332: `if()`
- Line 333: `if()`
- Line 342: `if()`
- Line 399: `for()`
- Line 400: `if()`
- Line 414: `if()`

## Backend/fastify-server/src/services/commerce/collection.service.ts

- Line 7: `findAll()`
- Line 28: `create()`
- Line 31: `if()`
- Line 40: `if()`
- Line 57: `update()`
- Line 62: `if()`
- Line 78: `delete()`
- Line 83: `if()`

## Backend/fastify-server/src/services/commerce/coupon.service.ts

- Line 8: `findAll()`
- Line 43: `create()`
- Line 51: `if()`
- Line 57: `if()`
- Line 72: `for()`
- Line 109: `disableByRule()`

## Backend/fastify-server/src/services/commerce/discountRules.service.ts

- Line 7: `findAll()`
- Line 12: `if()`
- Line 55: `create()`
- Line 74: `if()`
- Line 77: `if()`
- Line 105: `update()`
- Line 110: `if()`
- Line 125: `if()`
- Line 136: `delete()`
- Line 142: `if()`

## Backend/fastify-server/src/services/commerce/review.service.ts

- Line 7: `findAll()`
- Line 36: `approve()`
- Line 41: `if()`
- Line 54: `reject()`
- Line 59: `if()`
- Line 72: `delete()`
- Line 77: `if()`

## Backend/fastify-server/src/services/commerce/serviceCatalog.service.ts

- Line 8: `findAll()`
- Line 21: `create()`
- Line 40: `update()`
- Line 45: `if()`
- Line 61: `delete()`
- Line 66: `if()`
- Line 78: `getDashboard()`

## Backend/fastify-server/src/services/commerce/template-purchase.service.ts

- Line 26: `initiatePurchase()`
- Line 77: `verifyPurchase()`
- Line 86: `if()`
- Line 102: `if()`
- Line 148: `getSwapPrice()`
- Line 152: `applyTemplateToStore()`
- Line 158: `if()`

## Backend/fastify-server/src/services/core/account.service.ts

- Line 7: `getProfile()`
- Line 23: `updateProfile()`
- Line 41: `getOverview()`
- Line 60: `getSecurityStatus()`
- Line 87: `changePassword()`
- Line 94: `if()`
- Line 99: `if()`
- Line 113: `sendOtp()`
- Line 118: `if()`
- Line 140: `verifyOtp()`
- Line 153: `if()`
- Line 162: `if()`
- Line 173: `requestDeletion()`
- Line 188: `getGovernance()`
- Line 217: `getStore()`
- Line 238: `if()`
- Line 253: `updateOnboardingState()`
- Line 262: `if()`
- Line 265: `if()`
- Line 269: `if()`
- Line 276: `if()`
- Line 295: `if()`
- Line 306: `checkSlugAvailability()`

## Backend/fastify-server/src/services/core/billing.service.ts

- Line 7: `getSubscription()`
- Line 18: `upgradePlan()`
- Line 25: `if()`
- Line 33: `if()`
- Line 66: `downgradePlan()`
- Line 73: `if()`
- Line 91: `cancelSubscription()`
- Line 96: `if()`
- Line 114: `calculateProration()`
- Line 120: `if()`
- Line 128: `if()`
- Line 150: `verifyPayment()`
- Line 170: `verifyTemplate()`
- Line 175: `if()`
- Line 193: `getPaymentHistory()`
- Line 202: `getInvoices()`

## Backend/fastify-server/src/services/core/booking.service.ts

- Line 7: `getBookings()`
- Line 10: `if()`
- Line 49: `createBooking()`
- Line 100: `if()`
- Line 143: `createServiceProduct()`
- Line 170: `updateBookingStatus()`
- Line 175: `if()`
- Line 188: `cancelBooking()`
- Line 193: `if()`
- Line 213: `updateBooking()`
- Line 225: `if()`
- Line 245: `deleteBooking()`
- Line 250: `if()`

## Backend/fastify-server/src/services/core/customers.service.ts

- Line 40: `if()`
- Line 78: `if()`
- Line 142: `if()`
- Line 164: `if()`

## Backend/fastify-server/src/services/core/fulfillment.service.ts

- Line 7: `getShipments()`
- Line 13: `if()`
- Line 17: `if()`
- Line 18: `if()`
- Line 63: `createShipment()`
- Line 79: `if()`
- Line 102: `updateShipmentStatus()`
- Line 107: `if()`
- Line 120: `assignCourier()`
- Line 127: `if()`
- Line 145: `markAsDelivered()`
- Line 150: `if()`

## Backend/fastify-server/src/services/core/invoice-pdf.service.ts

- Line 73: `if()`
- Line 115: `if()`
- Line 179: `if()`
- Line 236: `if()`
- Line 345: `if()`
- Line 349: `if()`
- Line 353: `if()`
- Line 357: `if()`
- Line 409: `if()`
- Line 414: `if()`
- Line 489: `if()`
- Line 495: `switch()`
- Line 572: `if()`

## Backend/fastify-server/src/services/core/invoice.service.ts

- Line 7: `getInvoices()`
- Line 13: `if()`
- Line 17: `if()`
- Line 21: `if()`
- Line 76: `createInvoice()`
- Line 97: `if()`
- Line 101: `if()`
- Line 135: `updateInvoiceStatus()`
- Line 146: `if()`
- Line 150: `switch()`
- Line 152: `if()`
- Line 162: `if()`
- Line 180: `if()`
- Line 190: `if()`
- Line 201: `if()`
- Line 217: `if()`
- Line 231: `if()`

## Backend/fastify-server/src/services/core/ledger.service.ts

- Line 7: `getJournalEntries()`
- Line 29: `createJournalEntry()`
- Line 46: `if()`
- Line 56: `if()`

## Backend/fastify-server/src/services/core/orders.service.ts

- Line 87: `if()`
- Line 91: `if()`
- Line 95: `if()`
- Line 99: `if()`
- Line 107: `if()`
- Line 160: `if()`
- Line 167: `if()`
- Line 200: `if()`
- Line 213: `if()`
- Line 243: `if()`
- Line 249: `if()`
- Line 270: `if()`

## Backend/fastify-server/src/services/core/products.service.ts

- Line 39: `if()`
- Line 78: `if()`
- Line 82: `if()`
- Line 89: `if()`
- Line 131: `if()`
- Line 153: `if()`
- Line 171: `if()`
- Line 202: `if()`
- Line 264: `if()`
- Line 277: `if()`
- Line 308: `removeCalendarSync()`
- Line 314: `if()`
- Line 322: `if()`
- Line 342: `getCalendarSyncs()`
- Line 348: `if()`

## Backend/fastify-server/src/services/core/refund.service.ts

- Line 7: `getRefunds()`
- Line 13: `if()`
- Line 17: `if()`
- Line 74: `createRefund()`
- Line 89: `if()`
- Line 108: `if()`
- Line 117: `if()`
- Line 137: `processRefundAction()`
- Line 147: `if()`
- Line 151: `if()`
- Line 155: `if()`
- Line 167: `if()`

## Backend/fastify-server/src/services/core/return.service.ts

- Line 7: `getReturns()`
- Line 13: `if()`
- Line 17: `if()`
- Line 21: `if()`
- Line 86: `createReturn()`
- Line 102: `if()`
- Line 107: `for()`
- Line 109: `if()`
- Line 112: `if()`
- Line 157: `processReturnAction()`
- Line 163: `if()`
- Line 167: `switch()`
- Line 169: `if()`
- Line 184: `if()`
- Line 196: `if()`
- Line 208: `if()`
- Line 212: `if()`
- Line 248: `if()`
- Line 251: `if()`
- Line 266: `if()`
- Line 269: `if()`

## Backend/fastify-server/src/services/core/settings.service.ts

- Line 7: `getSettings()`
- Line 18: `updateSettings()`
- Line 23: `if()`
- Line 45: `getProfile()`
- Line 63: `updateProfile()`
- Line 81: `getPayments()`
- Line 96: `addBeneficiary()`
- Line 115: `deleteBeneficiary()`
- Line 120: `if()`
- Line 132: `getShipping()`
- Line 141: `createShippingOption()`
- Line 160: `getDelivery()`
- Line 169: `createDeliveryOption()`
- Line 187: `getIndustrySettings()`
- Line 202: `updateIndustrySettings()`
- Line 217: `getWhatsappSettings()`
- Line 225: `updateWhatsappSettings()`
- Line 232: `if()`
- Line 262: `getWhatsappTemplates()`
- Line 270: `getRoles()`
- Line 289: `createRole()`

## Backend/fastify-server/src/services/core/settlement.service.ts

- Line 7: `getSettlements()`

## Backend/fastify-server/src/services/core/subscriptions.service.ts

- Line 7: `getSubscriptions()`
- Line 44: `createSubscription()`
- Line 66: `updateSubscription()`
- Line 71: `if()`
- Line 88: `cancelSubscription()`
- Line 93: `if()`
- Line 110: `activateSubscription()`
- Line 115: `if()`
- Line 131: `getSubscriptionById()`
- Line 144: `if()`
- Line 151: `getSubscriptionUsage()`
- Line 159: `if()`
- Line 213: `createSubscriptionBox()`
- Line 254: `updateSubscriptionBox()`
- Line 259: `if()`
- Line 340: `createBoxSubscription()`
- Line 355: `if()`
- Line 378: `updateBoxSubscription()`
- Line 383: `if()`
- Line 401: `if()`
- Line 411: `if()`
- Line 438: `saveDunningConfig()`
- Line 449: `if()`
- Line 455: `if()`
- Line 465: `if()`
- Line 495: `triggerDunning()`
- Line 504: `if()`

## Backend/fastify-server/src/services/core/workflow.service.ts

- Line 6: `getWorkflows()`
- Line 13: `if()`
- Line 16: `if()`
- Line 22: `if()`
- Line 39: `createWorkflow()`
- Line 55: `if()`

## Backend/fastify-server/src/services/financial/billing.service.ts

- Line 22: `if()`
- Line 55: `if()`
- Line 97: `if()`
- Line 112: `if()`

## Backend/fastify-server/src/services/financial/paymentMethod.service.ts

- Line 7: `getPaymentMethods()`
- Line 34: `createPaymentMethod()`
- Line 37: `if()`
- Line 42: `if()`
- Line 94: `deletePaymentMethod()`
- Line 99: `if()`

## Backend/fastify-server/src/services/financial/payments.service.ts

- Line 58: `if()`
- Line 71: `if()`
- Line 85: `if()`
- Line 109: `if()`
- Line 348: `if()`
- Line 352: `if()`
- Line 406: `if()`
- Line 410: `if()`
- Line 414: `if()`
- Line 504: `if()`
- Line 510: `switch()`
- Line 569: `if()`
- Line 602: `if()`
- Line 629: `if()`
- Line 633: `if()`
- Line 675: `if()`
- Line 679: `if()`
- Line 683: `if()`

## Backend/fastify-server/src/services/financial/paystack.service.ts

- Line 60: `initializeTransaction()`
- Line 84: `verifyTransaction()`
- Line 175: `resolveBankAccount()`

## Backend/fastify-server/src/services/financial/wallet.service.ts

- Line 47: `if()`
- Line 112: `if()`
- Line 122: `if()`
- Line 126: `if()`
- Line 139: `if()`
- Line 286: `if()`
- Line 290: `if()`
- Line 352: `if()`
- Line 356: `if()`
- Line 361: `if()`
- Line 369: `if()`
- Line 414: `if()`
- Line 418: `if()`

## Backend/fastify-server/src/services/industry/beauty-dashboard.service.ts

- Line 7: `getDashboard()`
- Line 56: `getOverview()`

## Backend/fastify-server/src/services/industry/beauty-extended.service.ts

- Line 70: `if()`
- Line 79: `if()`
- Line 118: `if()`
- Line 179: `if()`
- Line 336: `if()`
- Line 446: `if()`
- Line 452: `if()`
- Line 465: `if()`

## Backend/fastify-server/src/services/industry/beauty.service.ts

- Line 7: `getStylists()`
- Line 44: `getStylistAvailability()`
- Line 62: `if()`
- Line 81: `getGallery()`
- Line 82: `if()`
- Line 97: `getPackages()`
- Line 123: `getServicePerformance()`

## Backend/fastify-server/src/services/industry/education.service.ts

- Line 7: `getEnrollments()`

## Backend/fastify-server/src/services/industry/events.service.ts

- Line 7: `getEvents()`
- Line 13: `if()`
- Line 38: `createEvent()`
- Line 61: `if()`
- Line 78: `getAttendees()`
- Line 103: `checkinAttendee()`
- Line 109: `if()`
- Line 125: `getVendors()`
- Line 134: `createVendor()`
- Line 154: `getSponsors()`
- Line 163: `createSponsor()`
- Line 182: `getTicketSales()`
- Line 188: `if()`
- Line 220: `getEventStats()`

## Backend/fastify-server/src/services/industry/grocery.service.ts

- Line 7: `getSuppliers()`
- Line 16: `if()`
- Line 48: `createSupplier()`
- Line 89: `getSupplierById()`
- Line 100: `updateSupplier()`
- Line 105: `if()`
- Line 118: `deleteSupplier()`
- Line 123: `if()`
- Line 135: `getSupplierProducts()`
- Line 150: `getDepartments()`
- Line 164: `createDepartment()`
- Line 182: `getDashboardStats()`

## Backend/fastify-server/src/services/industry/healthcare.service.ts

- Line 7: `getPatients()`
- Line 13: `if()`
- Line 48: `createPatient()`
- Line 68: `if()`
- Line 96: `getPatientById()`
- Line 112: `updatePatient()`
- Line 117: `if()`
- Line 130: `getPatientHistory()`
- Line 149: `getConsentForms()`
- Line 158: `getAppointments()`
- Line 163: `if()`
- Line 212: `createAppointment()`
- Line 246: `checkinAppointment()`
- Line 251: `if()`
- Line 267: `cancelAppointment()`
- Line 272: `if()`
- Line 289: `getLabs()`
- Line 298: `createLab()`
- Line 318: `getHealthcareStats()`

## Backend/fastify-server/src/services/industry/kitchen.service.ts

- Line 7: `getOrders()`
- Line 68: `getMetrics()`
- Line 115: `for()`
- Line 121: `if()`
- Line 140: `checkCapacity()`

## Backend/fastify-server/src/services/industry/legal.service.ts

- Line 7: `getCases()`

## Backend/fastify-server/src/services/industry/nightlife.service.ts

- Line 7: `getTickets()`
- Line 16: `if()`
- Line 21: `switch()`
- Line 85: `getReservations()`
- Line 89: `switch()`

## Backend/fastify-server/src/services/industry/portfolio.service.ts

- Line 7: `findAll()`
- Line 16: `create()`
- Line 19: `if()`
- Line 45: `findOne()`
- Line 50: `if()`
- Line 57: `update()`
- Line 62: `if()`
- Line 69: `if()`
- Line 71: `if()`
- Line 82: `if()`
- Line 99: `delete()`
- Line 104: `if()`

## Backend/fastify-server/src/services/industry/professionalServices.service.ts

- Line 7: `findProposals()`
- Line 25: `createProposal()`
- Line 46: `findOne()`
- Line 54: `if()`
- Line 61: `updateStatus()`
- Line 66: `if()`
- Line 79: `delete()`
- Line 84: `if()`
- Line 95: `getAnalytics()`
- Line 115: `getTeamMembers()`

## Backend/fastify-server/src/services/industry/property.service.ts

- Line 70: `if()`
- Line 144: `if()`
- Line 204: `if()`
- Line 231: `if()`
- Line 265: `if()`
- Line 331: `createRealEstateLead()`
- Line 352: `if()`
- Line 385: `getRealEstateLead()`
- Line 399: `if()`
- Line 406: `updateRealEstateLead()`
- Line 411: `if()`
- Line 424: `convertRealEstateLead()`
- Line 429: `if()`
- Line 445: `scoreRealEstateLead()`
- Line 450: `if()`
- Line 465: `getLeadPipeline()`
- Line 518: `createRealEstateTransaction()`
- Line 548: `getRealEstateTransaction()`
- Line 553: `if()`
- Line 560: `updateRealEstateTransaction()`
- Line 565: `if()`
- Line 578: `deleteRealEstateTransaction()`
- Line 583: `if()`
- Line 595: `addTransactionMilestone()`
- Line 600: `if()`
- Line 646: `createCMAReport()`
- Line 665: `getCMAReport()`
- Line 678: `if()`
- Line 685: `deleteCMAReport()`
- Line 690: `if()`
- Line 702: `generateCMA()`
- Line 708: `if()`
- Line 710: `if()`
- Line 760: `getAgentPerformance()`

## Backend/fastify-server/src/services/industry/quote.service.ts

- Line 60: `if()`
- Line 81: `if()`
- Line 89: `for()`
- Line 100: `if()`
- Line 108: `for()`
- Line 109: `if()`
- Line 172: `if()`
- Line 179: `if()`
- Line 183: `if()`
- Line 211: `if()`

## Backend/fastify-server/src/services/industry/rescue.service.ts

- Line 7: `getIncident()`
- Line 32: `if()`

## Backend/fastify-server/src/services/industry/restaurant.service.ts

- Line 7: `getKitchenTickets()`
- Line 58: `createKitchenTicket()`
- Line 65: `if()`
- Line 95: `updateTicketStatus()`
- Line 100: `if()`
- Line 117: `voidTicket()`
- Line 122: `if()`
- Line 139: `getKDSStations()`
- Line 148: `createKDSStation()`
- Line 166: `updateKDSStation()`
- Line 171: `if()`
- Line 184: `deleteKDSStation()`
- Line 189: `if()`
- Line 202: `getTicketStats()`

## Backend/fastify-server/src/services/industry/retail.service.ts

- Line 7: `getGiftCards()`
- Line 37: `issueGiftCard()`
- Line 69: `redeemGiftCard()`
- Line 74: `if()`
- Line 78: `if()`
- Line 100: `getCustomerSegments()`
- Line 114: `createCustomerSegment()`
- Line 133: `getLoyaltyTiers()`
- Line 142: `getLoyaltyPointsTransactions()`
- Line 164: `awardLoyaltyPoints()`
- Line 185: `if()`
- Line 203: `getStores()`
- Line 217: `createStore()`
- Line 249: `getStorePerformance()`
- Line 270: `getRetailStats()`

## Backend/fastify-server/src/services/industry/travel.service.ts

- Line 7: `findAll()`
- Line 16: `if()`
- Line 59: `create()`
- Line 78: `if()`
- Line 83: `if()`
- Line 88: `if()`
- Line 130: `findOne()`
- Line 151: `if()`
- Line 158: `updateStatus()`
- Line 163: `if()`
- Line 176: `delete()`
- Line 181: `if()`

## Backend/fastify-server/src/services/industry/vehicle.service.ts

- Line 7: `findAll()`
- Line 39: `create()`
- Line 53: `if()`
- Line 94: `findOne()`
- Line 106: `if()`
- Line 113: `update()`
- Line 122: `if()`
- Line 164: `delete()`
- Line 173: `if()`

## Backend/fastify-server/src/services/industry/wellness.service.ts

- Line 7: `findAppointments()`
- Line 17: `if()`
- Line 20: `if()`
- Line 23: `if()`
- Line 91: `createAppointment()`
- Line 111: `if()`
- Line 120: `if()`
- Line 146: `if()`
- Line 154: `if()`
- Line 202: `updateAppointmentStatus()`
- Line 207: `if()`

## Backend/fastify-server/src/services/industry/wholesale.service.ts

- Line 7: `getCustomers()`
- Line 14: `if()`
- Line 41: `createCustomer()`
- Line 79: `getCustomerOrders()`
- Line 92: `getProducts()`
- Line 116: `createProduct()`
- Line 146: `getProductInventory()`
- Line 154: `updateProductInventory()`
- Line 179: `getPurchaseOrders()`
- Line 204: `createPurchaseOrder()`
- Line 231: `autoGeneratePurchaseOrder()`
- Line 236: `if()`
- Line 244: `if()`
- Line 260: `getShipments()`
- Line 285: `createShipment()`
- Line 293: `if()`
- Line 315: `getWholesaleStats()`

## Backend/fastify-server/src/services/inventory/inventory.service.ts

- Line 83: `for()`
- Line 86: `if()`
- Line 125: `if()`
- Line 126: `if()`
- Line 134: `if()`
- Line 167: `if()`
- Line 213: `for()`
- Line 223: `if()`
- Line 238: `for()`
- Line 249: `if()`
- Line 283: `if()`
- Line 319: `for()`
- Line 324: `if()`
- Line 335: `if()`

## Backend/fastify-server/src/services/inventory/smart-restock.service.ts

- Line 26: `for()`
- Line 28: `if()`
- Line 114: `if()`
- Line 160: `for()`
- Line 173: `if()`
- Line 179: `if()`
- Line 225: `if()`
- Line 250: `if()`

## Backend/fastify-server/src/services/marketing/lead.service.ts

- Line 7: `findAll()`
- Line 10: `if()`
- Line 14: `if()`
- Line 38: `create()`
- Line 41: `if()`

## Backend/fastify-server/src/services/marketing/referral.service.ts

- Line 8: `getReferralData()`
- Line 17: `if()`
- Line 51: `generateCode()`
- Line 67: `getMonthlyDiscount()`

## Backend/fastify-server/src/services/meal-kit/recipe.service.ts

- Line 60: `if()`

## Backend/fastify-server/src/services/platform/account-deletion.service.ts

- Line 65: `requestDeletion()`
- Line 67: `if()`
- Line 90: `if()`
- Line 106: `cancelDeletion()`
- Line 110: `if()`
- Line 120: `getStatus()`
- Line 127: `executeDeletion()`
- Line 152: `if()`
- Line 166: `invalidateStoreSessions()`
- Line 176: `for()`
- Line 192: `checkBlockers()`

## Backend/fastify-server/src/services/platform/account-management.service.ts

- Line 38: `if()`
- Line 82: `if()`
- Line 137: `if()`
- Line 205: `if()`
- Line 238: `if()`
- Line 287: `for()`
- Line 335: `if()`

## Backend/fastify-server/src/services/platform/affiliate.service.ts

- Line 7: `getDashboard()`
- Line 70: `getPayoutApprovals()`

## Backend/fastify-server/src/services/platform/analytics.service.ts

- Line 7: `getAnalyticsOverview()`
- Line 29: `getPeriodStats()`
- Line 56: `getPerformanceMetrics()`
- Line 61: `if()`
- Line 291: `if()`
- Line 395: `trackEvent()`
- Line 413: `getInsights()`
- Line 487: `getEnhancedAnalytics()`

## Backend/fastify-server/src/services/platform/approval-execution.service.ts

- Line 8: `executeApproval()`
- Line 17: `if()`
- Line 21: `if()`
- Line 30: `if()`
- Line 45: `switch()`
- Line 110: `executeRefund()`
- Line 116: `executeCampaign()`
- Line 122: `executePolicy()`
- Line 128: `getApprovalStatus()`
- Line 140: `getPendingApprovals()`

## Backend/fastify-server/src/services/platform/b2b.service.ts

- Line 7: `getCreditApplications()`
- Line 40: `getRFQs()`

## Backend/fastify-server/src/services/platform/beta.service.ts

- Line 7: `getDesktopAppWaitlist()`

## Backend/fastify-server/src/services/platform/billing.service.ts

- Line 7: `createSubscription()`
- Line 31: `cancelSubscription()`
- Line 36: `if()`
- Line 52: `upgradeSubscription()`
- Line 62: `if()`
- Line 86: `calculateProratedAmount()`
- Line 111: `generateInvoice()`
- Line 124: `if()`
- Line 162: `getPaymentHistory()`
- Line 180: `handleFailedPayment()`
- Line 186: `if()`
- Line 216: `applyDiscount()`
- Line 229: `if()`
- Line 233: `if()`

## Backend/fastify-server/src/services/platform/blog.service.ts

- Line 7: `getPosts()`
- Line 37: `createPost()`
- Line 63: `publishPost()`
- Line 68: `if()`
- Line 85: `updatePost()`
- Line 90: `if()`
- Line 110: `deletePost()`
- Line 115: `if()`
- Line 127: `getCalendar()`
- Line 152: `getDashboardStats()`
- Line 183: `getSubscribers()`
- Line 192: `addSubscriber()`
- Line 197: `if()`

## Backend/fastify-server/src/services/platform/bnpl.service.ts

- Line 7: `getDashboard()`

## Backend/fastify-server/src/services/platform/calendar-sync.service.ts

- Line 7: `getCalendarEvents()`
- Line 45: `syncCalendar()`
- Line 54: `for()`

## Backend/fastify-server/src/services/platform/campaigns.service.ts

- Line 7: `getCampaigns()`
- Line 48: `createCampaign()`
- Line 80: `getCampaignById()`
- Line 90: `updateCampaign()`
- Line 95: `if()`
- Line 108: `deleteCampaign()`
- Line 113: `if()`
- Line 125: `getCampaignStats()`

## Backend/fastify-server/src/services/platform/compliance.service.ts

- Line 7: `exportGdprData()`
- Line 68: `if()`
- Line 175: `if()`
- Line 234: `if()`
- Line 427: `deleteGdprData()`
- Line 430: `if()`
- Line 452: `recordConsent()`
- Line 471: `getConsentHistory()`
- Line 480: `submitKyc()`
- Line 502: `getKycStatus()`
- Line 511: `submitKycCac()`
- Line 531: `getDisputes()`
- Line 557: `createDispute()`
- Line 577: `addDisputeEvidence()`
- Line 582: `if()`
- Line 601: `getAppeals()`
- Line 613: `createAppeal()`
- Line 633: `getLegalClients()`
- Line 648: `createLegalClient()`
- Line 667: `getClientCases()`
- Line 681: `getTimesheets()`
- Line 708: `approveTimesheet()`
- Line 713: `if()`
- Line 731: `getAppeals()`
- Line 737: `if()`
- Line 762: `createAppeal()`
- Line 765: `if()`
- Line 769: `if()`
- Line 778: `if()`

## Backend/fastify-server/src/services/platform/creative.service.ts

- Line 7: `getProjects()`
- Line 15: `if()`
- Line 42: `createProject()`
- Line 84: `getClients()`
- Line 98: `createClient()`
- Line 119: `getTasks()`
- Line 145: `createTask()`
- Line 176: `updateTaskStatus()`
- Line 181: `if()`
- Line 197: `getTimesheets()`
- Line 204: `if()`
- Line 229: `approveTimesheet()`
- Line 235: `if()`
- Line 251: `getInvoices()`
- Line 276: `getAssets()`
- Line 298: `getCreativeStats()`

## Backend/fastify-server/src/services/platform/credit.service.ts

- Line 7: `getBalance()`
- Line 14: `if()`
- Line 53: `useCredits()`
- Line 56: `if()`

## Backend/fastify-server/src/services/platform/dashboard.service.ts

- Line 22: `getOverview()`
- Line 91: `getRevenueChartData()`
- Line 126: `getRecentOrders()`
- Line 150: `getTopProducts()`
- Line 175: `if()`

## Backend/fastify-server/src/services/platform/data-governance.service.ts

- Line 33: `requestExport()`
- Line 52: `logAiTrace()`
- Line 73: `requestDeletion()`
- Line 92: `getExportRequests()`
- Line 100: `getDeletionRequests()`
- Line 108: `getAiTraces()`

## Backend/fastify-server/src/services/platform/delivery.service.ts

- Line 47: `checkReadiness()`
- Line 50: `if()`
- Line 54: `if()`
- Line 58: `if()`
- Line 72: `if()`
- Line 83: `autoDispatch()`
- Line 97: `if()`
- Line 107: `if()`
- Line 115: `if()`
- Line 123: `if()`
- Line 150: `if()`
- Line 191: `if()`
- Line 202: `if()`
- Line 242: `getOrderDeliveries()`
- Line 249: `updateShipmentStatus()`

## Backend/fastify-server/src/services/platform/domains.service.ts

- Line 17: `if()`
- Line 38: `if()`
- Line 73: `if()`
- Line 77: `if()`
- Line 126: `if()`
- Line 130: `if()`
- Line 136: `if()`
- Line 141: `if()`
- Line 160: `if()`
- Line 176: `if()`
- Line 186: `if()`
- Line 241: `for()`
- Line 244: `if()`
- Line 268: `if()`
- Line 296: `getDomains()`
- Line 305: `createDomain()`
- Line 324: `verifyDomain()`
- Line 329: `if()`
- Line 345: `deleteDomain()`
- Line 350: `if()`

## Backend/fastify-server/src/services/platform/finance-extended.service.ts

- Line 7: `getActivity()`
- Line 27: `getStatements()`
- Line 59: `generateStatement()`
- Line 100: `getBanks()`
- Line 117: `getPayouts()`

## Backend/fastify-server/src/services/platform/finance.service.ts

- Line 7: `getOverview()`
- Line 99: `getTransactions()`
- Line 194: `getStats()`
- Line 218: `generateFinanceStatements()`

## Backend/fastify-server/src/services/platform/health-check.service.ts

- Line 7: `comprehensive()`

## Backend/fastify-server/src/services/platform/health-score.service.ts

- Line 20: `if()`
- Line 57: `if()`
- Line 58: `switch()`
- Line 109: `if()`

## Backend/fastify-server/src/services/platform/integrations.service.ts

- Line 8: `handleInstagramCallback()`
- Line 16: `if()`
- Line 24: `if()`
- Line 36: `if()`
- Line 50: `if()`
- Line 62: `if()`
- Line 79: `if()`
- Line 88: `if()`
- Line 126: `if()`
- Line 136: `getInstagramConnection()`
- Line 142: `if()`
- Line 158: `disconnectInstagram()`
- Line 164: `if()`

## Backend/fastify-server/src/services/platform/kyc.service.ts

- Line 8: `submitForReview()`
- Line 59: `getStatus()`
- Line 73: `updateStatus()`
- Line 83: `if()`
- Line 112: `submitCAC()`
- Line 118: `if()`

## Backend/fastify-server/src/services/platform/marketing.service.ts

- Line 7: `getFlashSales()`
- Line 8: `if()`

## Backend/fastify-server/src/services/platform/marketplace.service.ts

- Line 7: `getVendors()`

## Backend/fastify-server/src/services/platform/merchant-team.service.ts

- Line 13: `getTeam()`
- Line 62: `getAudit()`
- Line 121: `if()`
- Line 206: `for()`
- Line 217: `if()`
- Line 219: `if()`
- Line 226: `if()`
- Line 266: `if()`
- Line 278: `if()`
- Line 329: `if()`
- Line 336: `if()`

## Backend/fastify-server/src/services/platform/nonprofit.service.ts

- Line 7: `getDonors()`
- Line 14: `if()`
- Line 42: `createDonor()`
- Line 89: `getDonorEngagement()`
- Line 99: `if()`
- Line 116: `getGrants()`
- Line 139: `createGrant()`
- Line 170: `getDonations()`
- Line 178: `if()`
- Line 201: `createDonation()`
- Line 232: `getNonprofitStats()`
- Line 286: `createGrant()`
- Line 289: `if()`
- Line 311: `getGrant()`
- Line 316: `if()`
- Line 323: `updateGrant()`
- Line 328: `if()`
- Line 341: `deleteGrant()`
- Line 346: `if()`
- Line 358: `getGrantPipeline()`

## Backend/fastify-server/src/services/platform/notifications.service.ts

- Line 7: `getNotifications()`
- Line 12: `if()`
- Line 16: `if()`
- Line 43: `markAsRead()`
- Line 49: `if()`
- Line 62: `markAllAsRead()`
- Line 68: `if()`
- Line 84: `getUnreadCount()`
- Line 90: `if()`
- Line 98: `createNotification()`
- Line 118: `sendBulkNotification()`
- Line 136: `deleteOldNotifications()`

## Backend/fastify-server/src/services/platform/nps.service.ts

- Line 23: `switch()`
- Line 41: `if()`
- Line 110: `if()`

## Backend/fastify-server/src/services/platform/onboarding-sync.service.ts

- Line 13: `syncOnboardingData()`
- Line 17: `if()`
- Line 73: `syncStoreProfile()`
- Line 87: `if()`
- Line 106: `syncWhatsAppChannel()`
- Line 113: `if()`
- Line 134: `syncBillingProfile()`
- Line 153: `if()`
- Line 171: `syncBankAccount()`
- Line 176: `if()`
- Line 195: `syncDeliverySettings()`
- Line 201: `if()`
- Line 214: `if()`
- Line 250: `syncKycStatus()`
- Line 255: `if()`

## Backend/fastify-server/src/services/platform/onboarding.service.ts

- Line 7: `getState()`
- Line 21: `if()`

## Backend/fastify-server/src/services/platform/ops-auth.service.ts

- Line 11: `bootstrapOwner()`
- Line 18: `if()`
- Line 37: `login()`
- Line 44: `if()`
- Line 81: `isRateLimited()`
- Line 98: `getSession()`
- Line 116: `logout()`
- Line 121: `logEvent()`
- Line 131: `createUser()`
- Line 132: `if()`
- Line 153: `updateUser()`
- Line 160: `deleteUser()`
- Line 167: `listUsers()`

## Backend/fastify-server/src/services/platform/playbooks.service.ts

- Line 106: `if()`

## Backend/fastify-server/src/services/platform/rbac.service.ts

- Line 136: `if()`
- Line 187: `if()`
- Line 192: `if()`
- Line 197: `if()`
- Line 205: `if()`
- Line 266: `if()`
- Line 281: `if()`
- Line 313: `if()`
- Line 325: `if()`
- Line 354: `if()`
- Line 362: `if()`
- Line 367: `if()`
- Line 406: `if()`
- Line 411: `if()`
- Line 416: `if()`
- Line 424: `if()`
- Line 425: `if()`
- Line 435: `if()`
- Line 436: `if()`
- Line 478: `if()`
- Line 482: `if()`
- Line 491: `if()`
- Line 515: `if()`
- Line 520: `if()`

## Backend/fastify-server/src/services/platform/rescue.service.ts

- Line 7: `reportIncident()`
- Line 10: `if()`
- Line 51: `getIncidentStatus()`
- Line 61: `if()`
- Line 68: `getIncidents()`
- Line 87: `analyzeAndSuggest()`
- Line 96: `if()`
- Line 133: `if()`
- Line 143: `if()`
- Line 174: `for()`

## Backend/fastify-server/src/services/platform/resource.service.ts

- Line 7: `listResources()`

## Backend/fastify-server/src/services/platform/return.service.ts

- Line 7: `createRequest()`
- Line 23: `if()`
- Line 48: `getRequests()`
- Line 55: `getRequestById()`
- Line 61: `updateStatus()`
- Line 70: `if()`
- Line 74: `if()`
- Line 92: `cancelRequest()`

## Backend/fastify-server/src/services/platform/security.service.ts

- Line 7: `checkSudoMode()`
- Line 21: `requireSudoMode()`
- Line 23: `if()`
- Line 31: `enableSudoMode()`
- Line 52: `disableSudoMode()`
- Line 67: `logSecurityEvent()`
- Line 84: `getSecurityAuditLog()`

## Backend/fastify-server/src/services/platform/site.service.ts

- Line 7: `getOverview()`
- Line 29: `if()`
- Line 42: `if()`
- Line 107: `updateSiteSettings()`
- Line 112: `if()`

## Backend/fastify-server/src/services/platform/social.service.ts

- Line 7: `getSocialConnections()`
- Line 16: `createSocialConnection()`
- Line 19: `if()`
- Line 41: `disconnectSocial()`
- Line 46: `if()`

## Backend/fastify-server/src/services/platform/storage.service.ts

- Line 7: `uploadFile()`
- Line 10: `if()`
- Line 16: `if()`
- Line 58: `getFiles()`
- Line 63: `if()`
- Line 86: `deleteFile()`
- Line 91: `if()`

## Backend/fastify-server/src/services/platform/storefront-builder.service.ts

- Line 7: `saveDraft()`
- Line 22: `publishStore()`
- Line 32: `if()`
- Line 58: `unpublishStore()`
- Line 71: `getPublishedStore()`
- Line 90: `if()`
- Line 101: `updateTheme()`
- Line 119: `addSection()`
- Line 151: `removeSection()`
- Line 160: `if()`
- Line 176: `reorderSections()`
- Line 185: `if()`
- Line 206: `previewStore()`
- Line 214: `if()`
- Line 225: `rollbackToVersion()`
- Line 233: `if()`
- Line 253: `getDesignHistory()`

## Backend/fastify-server/src/services/platform/support-escalation.service.ts

- Line 7: `triggerHandoff()`
- Line 53: `switch()`
- Line 66: `switch()`
- Line 81: `switch()`
- Line 90: `getTickets()`
- Line 98: `updateTicketStatus()`

## Backend/fastify-server/src/services/platform/support.service.ts

- Line 7: `getConversations()`
- Line 41: `getConversationById()`
- Line 59: `if()`
- Line 71: `createConversation()`
- Line 87: `sendMessage()`

## Backend/fastify-server/src/services/platform/team-management.service.ts

- Line 8: `inviteTeamMember()`
- Line 51: `acceptInvitation()`
- Line 59: `if()`
- Line 63: `if()`
- Line 101: `removeTeamMember()`
- Line 106: `if()`
- Line 111: `if()`
- Line 124: `updateRole()`
- Line 134: `if()`
- Line 158: `transferOwnership()`
- Line 172: `if()`
- Line 202: `getTeamMembers()`
- Line 233: `getAuditLog()`
- Line 236: `if()`
- Line 273: `revokeAccess()`
- Line 278: `if()`

## Backend/fastify-server/src/services/platform/template.service.ts

- Line 13: `findAll()`

## Backend/fastify-server/src/services/platform/webhook.service.ts

- Line 7: `getWebhooks()`
- Line 39: `handleKwikWebhook()`
- Line 73: `if()`
- Line 81: `if()`
- Line 86: `if()`
- Line 90: `if()`

## Backend/fastify-server/src/services/platform/websocket.service.ts

- Line 7: `broadcastMessage()`
- Line 10: `if()`
- Line 29: `getConnectionStats()`

## Backend/fastify-server/src/services/platform/webstudio.service.ts

- Line 7: `getStudioConfig()`
- Line 21: `if()`
- Line 35: `updateStudioConfig()`
- Line 40: `if()`
- Line 59: `publishChanges()`
- Line 83: `createProject()`
- Line 88: `if()`
- Line 92: `if()`
- Line 135: `exportProject()`
- Line 140: `if()`
- Line 144: `if()`

## Backend/fastify-server/src/services/pos/cash-management.service.ts

- Line 25: `if()`
- Line 56: `if()`
- Line 114: `if()`
- Line 164: `if()`

## Backend/fastify-server/src/services/pos/pos-sync.service.ts

- Line 26: `if()`
- Line 77: `if()`
- Line 102: `if()`
- Line 158: `switch()`
- Line 230: `if()`
- Line 250: `if()`

## Backend/fastify-server/src/services/rentals/rental.service.ts

- Line 78: `if()`
- Line 124: `switch()`
- Line 161: `if()`
- Line 167: `if()`
- Line 174: `if()`
- Line 236: `if()`

## Backend/fastify-server/src/services/security/fraud-detection.service.ts

- Line 82: `if()`
- Line 87: `if()`
- Line 145: `if()`
- Line 150: `if()`
- Line 166: `switch()`

## Backend/fastify-server/src/services/subscriptions/box-builder.service.ts

- Line 52: `if()`
- Line 107: `if()`
- Line 121: `if()`
- Line 128: `if()`
- Line 171: `if()`

## Backend/fastify-server/src/services/subscriptions/dunning.service.ts

- Line 20: `if()`
- Line 65: `if()`
- Line 79: `if()`
- Line 162: `if()`
- Line 203: `switch()`
- Line 236: `if()`
- Line 266: `if()`
- Line 292: `if()`

## Backend/fastify-server/src/services/subscriptions/trial-management.service.ts

- Line 178: `if()`
- Line 225: `if()`
- Line 229: `if()`
- Line 249: `if()`
- Line 377: `if()`
- Line 381: `if()`
- Line 411: `if()`
- Line 418: `if()`
- Line 496: `for()`
- Line 508: `if()`