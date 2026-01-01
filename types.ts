
export enum Goal {
  WeightLoss = "Emagrecimento",
  MuscleGain = "Ganho de Massa Muscular",
  GeneralHealth = "Saúde Geral",
}

export enum Verdict {
  Approved = "VEREDITO: 🟢 APROVADO",
  Moderation = "VEREDITO: 🟡 COM MODERAÇÃO",
  Trap = "VEREDITO: 🔴 É CILADA, BINO!",
}

export interface AnalysisResultData {
    verdict: Verdict;
    truth: string;
    details: string[];
    conclusion: string;
}
