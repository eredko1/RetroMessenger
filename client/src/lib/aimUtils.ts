export function formatScreenName(screenName: string): string {
  // Ensure screen name follows AIM conventions (max 20 chars, alphanumeric)
  return screenName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
}

export function formatMessage(message: string): string {
  // Basic message formatting for AIM-style display
  return message.trim().substring(0, 1000); // Limit message length
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'online':
      return '🟢';
    case 'away':
      return '🟡';
    case 'offline':
      return '⚫';
    default:
      return '⚫';
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function isValidScreenName(screenName: string): boolean {
  return /^[a-zA-Z0-9]{3,20}$/.test(screenName);
}
