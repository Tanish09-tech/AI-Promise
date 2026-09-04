import { PolicyConfig } from '../types/commit';

export const defaultPolicyConfig: PolicyConfig = {
  max_reminders: 3,
  minimum_hours_between_reminders: 24,
  auto_action_confidence_threshold: 0.85,
  allow_duplicate_actions: false
};
