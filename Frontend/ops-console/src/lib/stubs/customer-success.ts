// Stub for @vayva/customer-success - package needs to be created
export const BUILT_IN_PLAYBOOKS = [
  { id: 'cart_recovery', name: 'Cart Recovery' },
  { id: 'review_request', name: 'Review Request' },
  { id: 'welcome_series', name: 'Welcome Series' },
];

export const getEnabledPlaybooks = async (_storeId: string) => BUILT_IN_PLAYBOOKS;
