export async function fetchSuggestedActions(storeId) {
    const res = await fetch(`/api/dashboard/actions?storeId=${storeId}`);
    return res.json();
}
