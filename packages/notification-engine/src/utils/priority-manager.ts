export class PriorityManager {
  private priorityLevels: Record<string, number> = {
    'low': 1,
    'normal': 2,
    'high': 3,
    'urgent': 4,
    'emergency': 5
  };

  getPriorityLevel(priority: string): number {
    return this.priorityLevels[priority.toLowerCase()] || 2;
  }

  isHigherPriority(priority1: string, priority2: string): boolean {
    return this.getPriorityLevel(priority1) > this.getPriorityLevel(priority2);
  }

  canEscalate(currentPriority: string, targetPriority: string): boolean {
    return this.isHigherPriority(targetPriority, currentPriority);
  }

  escalatePriority(currentPriority: string, escalationMinutes: number, maxPriority: string = 'emergency'): string {
    const currentLevel = this.getPriorityLevel(currentPriority);
    const maxLevel = this.getPriorityLevel(maxPriority);
    
    // Simple escalation based on time - in real implementation, this would be more sophisticated
    const escalationFactor = Math.min(Math.floor(escalationMinutes / 30), maxLevel - currentLevel);
    const newLevel = Math.min(currentLevel + escalationFactor, maxLevel);
    
    return this.getPriorityName(newLevel);
  }

  private getPriorityName(level: number): string {
    const entries = Object.entries(this.priorityLevels);
    const found = entries.find(([_, value]) => value === level);
    return found ? found[0] : 'normal';
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'blue';
      case 'normal': return 'gray';
      case 'high': return 'yellow';
      case 'urgent': return 'orange';
      case 'emergency': return 'red';
      default: return 'gray';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'ℹ️';
      case 'normal': return '🔔';
      case 'high': return '⚠️';
      case 'urgent': return '🚨';
      case 'emergency': return '❗';
      default: return '🔔';
    }
  }
}