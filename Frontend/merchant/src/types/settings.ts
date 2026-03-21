export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

export interface CustomRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface TeamResponse {
  members: Member[];
  invites: Invite[];
}
