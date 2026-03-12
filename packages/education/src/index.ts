export interface Tutorial {
  id: string;
  title: string;
  videoUrl?: string;
  category: "onboarding" | "marketing" | "operations";
}

export const EducationService = {
  getTutorials: async (category?: string): Promise<Tutorial[]> => {
    // Mock content for now
    const tutorials: Tutorial[] = [
      { id: "1", title: "Setting up your Store", category: "onboarding", videoUrl: "https://youtu.be/example" },
      { id: "2", title: "How to run Ads", category: "marketing" }
    ];

    if (category) return tutorials.filter(t => t.category === category);
    return tutorials;
  }
}
