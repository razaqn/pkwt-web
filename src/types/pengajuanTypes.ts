export interface PengajuanEmployee {
  nik: string;
  name: string;
  isRegistered: boolean;
  id?: string;
}

export interface PengajuanData {
  id: string;
  type: "PKWT" | "PKWTT";
  employeeCount: number;
  employeeNames: string[];
  duration: string;
  startDate: string;
  status: "null" | "pending" | "rejected" | "approved";
  employees: PengajuanEmployee[];
}

export interface SubmissionData {
  id?: string;
  type: "PKWT" | "PKWTT";
  nikList: string[];
  duration?: string;
  startDate: string;
  status?: "null" | "pending" | "rejected" | "approved";
  employees?: PengajuanEmployee[];
}