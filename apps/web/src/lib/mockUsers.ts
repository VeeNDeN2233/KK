export type CandidateUser = {
  id: string;
  username: string;
  city?: string;
  tradeByMail: boolean;
  tradeInPerson: boolean;
  inventory: Record<
    string,
    {
      forTrade: string[];
      wanted: string[];
    }
  >;
};

export const mockCandidates: CandidateUser[] = [
  {
    id: "u1",
    username: "igor13",
    city: "Москва",
    tradeByMail: true,
    tradeInPerson: true,
    inventory: {
      panini_world_cup_2026_adrenalyn_xl: {
        forTrade: ["5", "7", "12", "33", "41", "55"],
        wanted: ["2", "8", "19", "40"],
      },
    },
  },
  {
    id: "u2",
    username: "otvinta72",
    city: "Екатеринбург",
    tradeByMail: true,
    tradeInPerson: false,
    inventory: {
      panini_world_cup_2026_adrenalyn_xl: {
        forTrade: ["1", "2", "3", "9", "18", "27"],
        wanted: ["7", "12", "33"],
      },
    },
  },
  {
    id: "u3",
    username: "fest",
    city: "Москва",
    tradeByMail: false,
    tradeInPerson: true,
    inventory: {
      panini_world_cup_2026_adrenalyn_xl: {
        forTrade: ["10", "11", "12", "13", "14", "15"],
        wanted: ["1", "5", "9", "18"],
      },
    },
  },
];

