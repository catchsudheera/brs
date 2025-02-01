import { publicUrl } from "@/utils/constants";

interface TelegramInlineKeyboard {
  inline_keyboard: Array<Array<{
    text: string;
    url?: string;
    callback_data?: string;
  }>>;
}

interface NotificationOptions {
  title: string;
  message: string;
  buttons?: TelegramInlineKeyboard;
}

class NotificationService {
  private async sendNotification(options: NotificationOptions) {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Notification Error:', error);
      throw error;
    }
  }

  async notifyGameStarted(gameId: string) {
    const gameViewerUrl = encodeURI(`${publicUrl}/game-viewer?gameId=${gameId}`);
    
    return this.sendNotification({
      title: `🏸 Game #${gameId.slice(-4)} has started!`,
      message: `Track live scores, groups and game combinations by clicking the button below.`,
      buttons: {
        inline_keyboard: [[
          {
            text: '📊 Track Scores',
            url: gameViewerUrl
          }
        ]]
      }
    });
  }

  async notifyGameCompleted(gameId: string) {
    return this.sendNotification({
      title: `🏆 Game #${gameId.slice(-4)} has been completed!`,
      message: `Game #${gameId.slice(-4)} has been completed and scores have been processed. Check the updated rankings by clicking the button below.`,
      buttons: {
        inline_keyboard: [[
          {
            text: '🏆 Check Rankings',
            url: encodeURI(`${publicUrl}`)
          }
        ]]
      }
    });
  }

  async notifyGameCancelled(gameId: string) {
    return this.sendNotification({
      title: '❌ Game Cancelled',
      message: `Game #${gameId.slice(-4)} has been cancelled.`
    });
  }
}

export const notificationService = new NotificationService(); 