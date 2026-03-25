/** Loose delegates for petcare models not yet on the generated Prisma client. */
type LooseModelDelegate = {
  findMany(args?: object): Promise<unknown[]>;
  findFirst(args?: object): Promise<unknown | null>;
  findUnique(args?: object): Promise<unknown | null>;
  create(args?: object): Promise<unknown>;
  update(args?: object): Promise<unknown>;
  delete(args?: object): Promise<unknown>;
  count(args?: object): Promise<number>;
  updateMany(args?: object): Promise<unknown>;
  upsert?(args?: object): Promise<unknown>;
  deleteMany?(args?: object): Promise<unknown>;
  groupBy?(args?: object): Promise<unknown[]>;
  aggregate?(args?: object): Promise<unknown>;
};

export type PetcareDb = {
  pet: LooseModelDelegate;
  petOwner: LooseModelDelegate;
  petAppointment: LooseModelDelegate & {
    groupBy(args?: object): Promise<unknown[]>;
    aggregate(args?: object): Promise<unknown>;
  };
  vaccinationRecord: LooseModelDelegate;
  medicalRecord: LooseModelDelegate;
};
