export async function mustUpdateScoped(
  updateManyPromise: Promise<{ count: number }>,
  notFoundMessage = "Not found",
) {
  const res = await updateManyPromise;
  if (res.count === 0) {
    throw new Error(notFoundMessage);
  }
  return res;
}

export async function mustDeleteScoped(
  deleteManyPromise: Promise<{ count: number }>,
  notFoundMessage = "Not found",
) {
  const res = await deleteManyPromise;
  if (res.count === 0) {
    throw new Error(notFoundMessage);
  }
  return res;
}
