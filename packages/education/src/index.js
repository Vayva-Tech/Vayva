export const EducationService = {
    getTutorials: async (category) => {
        // Mock content for now
        const tutorials = [
            { id: "1", title: "Setting up your Store", category: "onboarding", videoUrl: "https://youtu.be/example" },
            { id: "2", title: "How to run Ads", category: "marketing" }
        ];
        if (category)
            return tutorials.filter(t => t.category === category);
        return tutorials;
    }
};
