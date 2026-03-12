import { prisma } from '@/lib/prisma';
import type { Prisma } from '@vayva/db';
import type {
  ClientProofing,
  ProofingStatus,
  CreateClientProofingInput,
  ClientSelectionInput,
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  ContractTemplate,
  ContractType,
  CreateContractTemplateInput,
  SignedContract,
  ContractStatus,
  CreateSignedContractInput,
  SignContractInput,
} from '@/types/phase3-industry';

// Prisma types for database entities
type PrismaClientProofing = Prisma.ClientProofingGetPayload<object>;
type PrismaTimeEntry = Prisma.TimeEntryGetPayload<object>;
type PrismaContractTemplate = Prisma.ContractTemplateGetPayload<object>;
type PrismaSignedContract = Prisma.SignedContractGetPayload<object>;

// Prisma input types
type SignedContractUpdateInput = Prisma.SignedContractUpdateInput;

export class CreativePortfolioService {
  // ===== CLIENT PROOFING =====

  async getClientProofings(
    storeId: string,
    filters?: { clientId?: string; status?: ProofingStatus }
  ): Promise<ClientProofing[]> {
    const proofings = await prisma.clientProofing?.findMany({
      where: {
        storeId,
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.status && { status: filters.status.toUpperCase() as string }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return proofings.map((p: PrismaClientProofing) => ({
      id: p.id,
      storeId: p.storeId,
      clientId: p.clientId,
      projectId: p.projectId,
      title: p.title,
      images: p.images as unknown as { id: string; url: string; thumbnail: string; filename: string }[],
      status: (p.status as string).toLowerCase() as ProofingStatus,
      selectedImages: p.selectedImages,
      feedback: p.feedback ?? undefined,
      revisionRound: p.revisionRound,
      expiresAt: p.expiresAt ?? undefined,
      password: p.password ?? undefined,
      viewedAt: p.viewedAt ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getClientProofingById(id: string): Promise<ClientProofing | null> {
    const proofing = await prisma.clientProofing?.findUnique({
      where: { id },
    });

    if (!proofing) return null;

    // Mark as viewed if not already
    if (!proofing.viewedAt) {
      await prisma.clientProofing?.update({
        where: { id },
        data: { viewedAt: new Date() },
      });
    }

    return {
      id: proofing.id,
      storeId: proofing.storeId,
      clientId: proofing.clientId,
      projectId: proofing.projectId,
      title: proofing.title,
      images: proofing.images as unknown as { id: string; url: string; thumbnail: string; filename: string }[],
      status: (proofing.status as string).toLowerCase() as ProofingStatus,
      selectedImages: proofing.selectedImages,
      feedback: proofing.feedback ?? undefined,
      revisionRound: proofing.revisionRound,
      expiresAt: proofing.expiresAt ?? undefined,
      password: proofing.password ?? undefined,
      viewedAt: proofing.viewedAt ?? new Date(),
      createdAt: proofing.createdAt,
      updatedAt: proofing.updatedAt,
    };
  }

  async createClientProofing(data: CreateClientProofingInput): Promise<ClientProofing> {
    const proofing = await prisma.clientProofing?.create({
      data: {
        storeId: data.storeId,
        clientId: data.clientId,
        projectId: data.projectId,
        title: data.title,
        images: data.images as Prisma.InputJsonValue,
        status: 'pending',
        selectedImages: [],
        expiresAt: data.expiresAt,
        password: data.password,
      },
    });

    return {
      id: proofing.id,
      storeId: proofing.storeId,
      clientId: proofing.clientId,
      projectId: proofing.projectId,
      title: proofing.title,
      images: proofing.images as unknown as { id: string; url: string; thumbnail: string; filename: string }[],
      status: (proofing.status as string).toLowerCase() as ProofingStatus,
      selectedImages: proofing.selectedImages,
      feedback: proofing.feedback ?? undefined,
      revisionRound: proofing.revisionRound,
      expiresAt: proofing.expiresAt ?? undefined,
      password: proofing.password ?? undefined,
      viewedAt: proofing.viewedAt ?? undefined,
      createdAt: proofing.createdAt,
      updatedAt: proofing.updatedAt,
    };
  }

  async submitClientSelection(
    id: string,
    data: ClientSelectionInput
  ): Promise<ClientProofing> {
    const proofing = await prisma.clientProofing?.update({
      where: { id },
      data: {
        selectedImages: data.selectedImageIds,
        feedback: data.feedback,
        status: 'approved',
      },
    });

    return {
      id: proofing.id,
      storeId: proofing.storeId,
      clientId: proofing.clientId,
      projectId: proofing.projectId,
      title: proofing.title,
      images: proofing.images as unknown as { id: string; url: string; thumbnail: string; filename: string }[],
      status: (proofing.status as string).toLowerCase() as ProofingStatus,
      selectedImages: proofing.selectedImages,
      feedback: proofing.feedback ?? undefined,
      revisionRound: proofing.revisionRound,
      expiresAt: proofing.expiresAt ?? undefined,
      password: proofing.password ?? undefined,
      viewedAt: proofing.viewedAt ?? undefined,
      createdAt: proofing.createdAt,
      updatedAt: proofing.updatedAt,
    };
  }

  async requestRevisions(id: string, feedback: string): Promise<ClientProofing> {
    const proofing = await prisma.clientProofing?.update({
      where: { id },
      data: {
        status: 'revisions_requested',
        feedback,
        revisionRound: { increment: 1 },
      },
    });

    return {
      id: proofing.id,
      storeId: proofing.storeId,
      clientId: proofing.clientId,
      projectId: proofing.projectId,
      title: proofing.title,
      images: proofing.images as unknown as { id: string; url: string; thumbnail: string; filename: string }[],
      status: (proofing.status as string).toLowerCase() as ProofingStatus,
      selectedImages: proofing.selectedImages,
      feedback: proofing.feedback ?? undefined,
      revisionRound: proofing.revisionRound,
      expiresAt: proofing.expiresAt ?? undefined,
      password: proofing.password ?? undefined,
      viewedAt: proofing.viewedAt ?? undefined,
      createdAt: proofing.createdAt,
      updatedAt: proofing.updatedAt,
    };
  }

  // ===== TIME TRACKING =====

  async getTimeEntries(
    storeId: string,
    filters?: { userId?: string; projectId?: string; clientId?: string; billable?: boolean }
  ): Promise<TimeEntry[]> {
    const entries = await prisma.timeEntry?.findMany({
      where: {
        storeId,
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.projectId && { projectId: filters.projectId }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.billable !== undefined && { billable: filters.billable }),
      },
      orderBy: { startedAt: 'desc' },
    });

    return entries.map((e: PrismaTimeEntry) => ({
      id: e.id,
      storeId: e.storeId,
      userId: e.userId,
      projectId: e.projectId ?? undefined,
      clientId: e.clientId ?? undefined,
      task: e.task,
      description: e.description ?? undefined,
      startedAt: e.startedAt,
      endedAt: e.endedAt ?? undefined,
      duration: e.duration,
      hourlyRate: e.hourlyRate ? Number(e.hourlyRate) : undefined,
      billable: e.billable,
      invoiced: e.invoiced,
      invoiceId: e.invoiceId ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  }

  async startTimeTracking(data: CreateTimeEntryInput): Promise<TimeEntry> {
    const entry = await prisma.timeEntry?.create({
      data: {
        storeId: data.storeId,
        userId: data.userId,
        projectId: data.projectId,
        clientId: data.clientId,
        task: data.task,
        description: data.description,
        startedAt: data.startedAt,
        hourlyRate: data.hourlyRate,
        billable: data.billable ?? true,
        invoiced: false,
        duration: 0,
      },
    });

    return {
      id: entry.id,
      storeId: entry.storeId,
      userId: entry.userId,
      projectId: entry.projectId ?? undefined,
      clientId: entry.clientId ?? undefined,
      task: entry.task,
      description: entry.description ?? undefined,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt ?? undefined,
      duration: entry.duration,
      hourlyRate: entry.hourlyRate ? Number(entry.hourlyRate) : undefined,
      billable: entry.billable,
      invoiced: entry.invoiced,
      invoiceId: entry.invoiceId ?? undefined,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  async stopTimeTracking(id: string, data?: UpdateTimeEntryInput): Promise<TimeEntry> {
    const entry = await prisma.timeEntry?.findUnique({ where: { id } });
    if (!entry) {
      throw new Error('Time entry not found');
    }

    const endedAt = data?.endedAt || new Date();
    const duration = Math.floor((endedAt.getTime() - entry.startedAt?.getTime()) / 60000);

    const updated = await prisma.timeEntry?.update({
      where: { id },
      data: {
        endedAt,
        duration,
        description: data?.description,
      },
    });

    return {
      id: updated.id,
      storeId: updated.storeId,
      userId: updated.userId,
      projectId: updated.projectId ?? undefined,
      clientId: updated.clientId ?? undefined,
      task: updated.task,
      description: updated.description ?? undefined,
      startedAt: updated.startedAt,
      endedAt: updated.endedAt ?? undefined,
      duration: updated.duration,
      hourlyRate: updated.hourlyRate ? Number(updated.hourlyRate) : undefined,
      billable: updated.billable,
      invoiced: updated.invoiced,
      invoiceId: updated.invoiceId ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async getTimeReport(
    storeId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<{
    totalHours: number;
    billableHours: number;
    totalValue: number;
    entries: TimeEntry[];
  }> {
    const entries = await prisma.timeEntry?.findMany({
      where: {
        storeId,
        startedAt: { gte: startDate, lte: endDate },
        ...(userId && { userId }),
      },
      orderBy: { startedAt: 'desc' },
    });

    const mapped = entries.map((e: PrismaTimeEntry) => ({
      id: e.id,
      storeId: e.storeId,
      userId: e.userId,
      projectId: e.projectId ?? undefined,
      clientId: e.clientId ?? undefined,
      task: e.task,
      description: e.description ?? undefined,
      startedAt: e.startedAt,
      endedAt: e.endedAt ?? undefined,
      duration: e.duration,
      hourlyRate: e.hourlyRate ? Number(e.hourlyRate) : undefined,
      billable: e.billable,
      invoiced: e.invoiced,
      invoiceId: e.invoiceId ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    const totalMinutes = mapped.reduce((sum: number, e: TimeEntry) => sum + e.duration, 0);
    const billableMinutes = mapped
      .filter((e: TimeEntry) => e.billable)
      .reduce((sum: number, e: TimeEntry) => sum + e.duration, 0);
    const totalValue = mapped
      .filter((e: TimeEntry) => e.billable && e.hourlyRate)
      .reduce((sum: number, e: TimeEntry) => sum + (e.duration / 60) * (e.hourlyRate || 0), 0);

    return {
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      billableHours: Math.round((billableMinutes / 60) * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      entries: mapped,
    };
  }

  // ===== CONTRACTS =====

  async getContractTemplates(
    storeId: string,
    type?: ContractType
  ): Promise<ContractTemplate[]> {
    const templates = await prisma.contractTemplate?.findMany({
      where: {
        storeId,
        isActive: true,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return templates.map((t: PrismaContractTemplate) => ({
      id: t.id,
      storeId: t.storeId,
      name: t.name,
      type: t.type as ContractType,
      content: t.content,
      variables: t.variables,
      defaultTerms: t.defaultTerms as Record<string, string>,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async createContractTemplate(data: CreateContractTemplateInput): Promise<ContractTemplate> {
    const template = await prisma.contractTemplate?.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        type: data.type,
        content: data.content,
        variables: data.variables ?? [],
        defaultTerms: data.defaultTerms as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return {
      id: template.id,
      storeId: template.storeId,
      name: template.name,
      type: template.type as ContractType,
      content: template.content,
      variables: template.variables,
      defaultTerms: template.defaultTerms as Record<string, string>,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async renderContract(
    templateId: string,
    filledData: Record<string, string>
  ): Promise<string> {
    const template = await prisma.contractTemplate?.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Contract template not found');
    }

    let content = template.content;
    for (const [key, value] of Object.entries(filledData)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return content;
  }

  async createSignedContract(data: CreateSignedContractInput): Promise<SignedContract> {
    const template = await prisma.contractTemplate?.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new Error('Contract template not found');
    }

    const finalContent = await this.renderContract(data.templateId, data.filledData);

    const contract = await prisma.signedContract?.create({
      data: {
        templateId: data.templateId,
        clientId: data.clientId,
        projectId: data.projectId,
        filledData: data.filledData as Prisma.InputJsonValue,
        finalContent,
        status: 'draft',
      },
    });

    return {
      id: contract.id,
      templateId: contract.templateId,
      clientId: contract.clientId,
      projectId: contract.projectId ?? undefined,
      filledData: contract.filledData as Record<string, string>,
      finalContent: contract.finalContent,
      status: (contract.status as string).toLowerCase() as ContractStatus,
      sentAt: contract.sentAt ?? undefined,
      signedAt: contract.signedAt ?? undefined,
      clientSignature: contract.clientSignature ?? undefined,
      providerSignature: contract.providerSignature ?? undefined,
      pdfUrl: contract.pdfUrl ?? undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  async sendContract(id: string): Promise<SignedContract> {
    const contract = await prisma.signedContract?.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return {
      id: contract.id,
      templateId: contract.templateId,
      clientId: contract.clientId,
      projectId: contract.projectId ?? undefined,
      filledData: contract.filledData as Record<string, string>,
      finalContent: contract.finalContent,
      status: (contract.status as string).toLowerCase() as ContractStatus,
      sentAt: contract.sentAt ?? undefined,
      signedAt: contract.signedAt ?? undefined,
      clientSignature: contract.clientSignature ?? undefined,
      providerSignature: contract.providerSignature ?? undefined,
      pdfUrl: contract.pdfUrl ?? undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  async signContract(id: string, data: SignContractInput): Promise<SignedContract> {
    const updateData: SignedContractUpdateInput = {
      status: 'signed',
      signedAt: new Date(),
    };

    if (data.signedBy === 'client') {
      updateData.clientSignature = data.signature;
    } else {
      updateData.providerSignature = data.signature;
    }

    const contract = await prisma.signedContract?.update({
      where: { id },
      data: updateData,
    });

    return {
      id: contract.id,
      templateId: contract.templateId,
      clientId: contract.clientId,
      projectId: contract.projectId ?? undefined,
      filledData: contract.filledData as Record<string, string>,
      finalContent: contract.finalContent,
      status: (contract.status as string).toLowerCase() as ContractStatus,
      sentAt: contract.sentAt ?? undefined,
      signedAt: contract.signedAt ?? undefined,
      clientSignature: contract.clientSignature ?? undefined,
      providerSignature: contract.providerSignature ?? undefined,
      pdfUrl: contract.pdfUrl ?? undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  async getClientContracts(clientId: string): Promise<SignedContract[]> {
    const contracts = await prisma.signedContract?.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map((c: PrismaSignedContract) => ({
      id: c.id,
      templateId: c.templateId,
      clientId: c.clientId,
      projectId: c.projectId ?? undefined,
      filledData: c.filledData as Record<string, string>,
      finalContent: c.finalContent,
      status: (c.status as string).toLowerCase() as ContractStatus,
      sentAt: c.sentAt ?? undefined,
      signedAt: c.signedAt ?? undefined,
      clientSignature: c.clientSignature ?? undefined,
      providerSignature: c.providerSignature ?? undefined,
      pdfUrl: c.pdfUrl ?? undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }
}

export const creativePortfolioService = new CreativePortfolioService();
