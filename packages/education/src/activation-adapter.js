/**
 * Activation-Aware Education Adapter
 *
 * Adapts guidance to user's activation level.
 * Education fades as competence grows.
 */
export class ActivationAdapter {
    /**
     * Determine guidance level based on activation status
     */
    static getGuidanceLevel(activationStatus) {
        // Not activated yet - show more guidance
        if (!activationStatus.isActivated) {
            return "verbose";
        }
        // Recently activated (< 1 week) - standard guidance
        const oneWeekInMinutes = 7 * 24 * 60;
        if (activationStatus.timeToActivation &&
            activationStatus.timeToActivation < oneWeekInMinutes) {
            return "standard";
        }
        // Experienced user - minimal guidance
        return "minimal";
    }
    /**
     * Get guidance configuration based on activation
     */
    static getGuidanceConfig(activationStatus) {
        const level = this.getGuidanceLevel(activationStatus);
        switch (level) {
            case "verbose":
                return {
                    level: "verbose",
                    showEmptyStates: true,
                    showFirstTimeHints: true,
                    showWorkflowNudges: true,
                    showExplanations: true,
                };
            case "standard":
                return {
                    level: "standard",
                    showEmptyStates: true,
                    showFirstTimeHints: true,
                    showWorkflowNudges: true,
                    showExplanations: false, // Reduce explanations
                };
            case "minimal":
                return {
                    level: "minimal",
                    showEmptyStates: false, // User knows what empty states mean
                    showFirstTimeHints: false, // User is experienced
                    showWorkflowNudges: true, // Still helpful for workflow issues
                    showExplanations: false,
                };
        }
    }
    /**
     * Adjust guidance message based on level
     */
    static adjustMessage(message, level) {
        switch (level) {
            case "verbose":
                // Full message with explanation
                return message;
            case "standard":
                // Slightly condensed
                return message.split(".")[0] + "."; // First sentence only
            case "minimal":
                // Very brief
                const words = message.split(" ");
                return words.slice(0, Math.min(10, words.length)).join(" ") + "...";
        }
    }
    /**
     * Check if specific guidance type should show
     */
    static shouldShowGuidanceType(type, activationStatus) {
        const config = this.getGuidanceConfig(activationStatus);
        switch (type) {
            case "empty_state":
                return config.showEmptyStates;
            case "first_action":
                return config.showFirstTimeHints;
            case "workflow_stall":
                return config.showWorkflowNudges;
            case "explanation":
                return config.showExplanations;
            default:
                return false;
        }
    }
}
/**
 * Education progression rules
 */
export const EducationProgression = {
    /**
     * Before activation: More explanation, clear next steps, gentle reassurance
     */
    BEFORE_ACTIVATION: {
        tone: "explanatory",
        detail: "high",
        nextSteps: "explicit",
    },
    /**
     * After activation: Reduced guidance, quieter interface, no repeated hints
     */
    AFTER_ACTIVATION: {
        tone: "concise",
        detail: "low",
        nextSteps: "implicit",
    },
};
