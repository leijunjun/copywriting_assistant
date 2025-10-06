/**
 * Real-time Credit Balance Updates
 * 
 * This module provides real-time credit balance updates using WebSocket connections.
 */

import { logger } from '@/lib/utils/logger';
import { CustomError } from '@/lib/utils/error';

interface RealtimeConfig {
  websocketUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

interface CreditUpdateEvent {
  userId: string;
  balance: number;
  transactionId: string;
  transactionType: 'deduction' | 'bonus' | 'refund' | 'recharge';
  amount: number;
  description: string;
  timestamp: string;
}

interface RealtimeConnection {
  userId: string;
  socket: WebSocket;
  isConnected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
}

class RealtimeCreditUpdates {
  private config: RealtimeConfig;
  private connections: Map<string, RealtimeConnection> = new Map();
  private eventHandlers: Map<string, Set<(event: CreditUpdateEvent) => void>> = new Map();

  constructor(config: RealtimeConfig) {
    this.config = config;
    this.startHeartbeat();
  }

  /**
   * Connect user to real-time updates
   */
  async connectUser(userId: string): Promise<void> {
    try {
      if (this.connections.has(userId)) {
        logger.debug('User already connected to real-time updates', { userId });
        return;
      }

      const socket = new WebSocket(`${this.config.websocketUrl}/credits/${userId}`);
      
      const connection: RealtimeConnection = {
        userId,
        socket,
        isConnected: false,
        reconnectAttempts: 0,
        lastHeartbeat: Date.now(),
      };

      socket.onopen = () => {
        connection.isConnected = true;
        connection.reconnectAttempts = 0;
        logger.realtime('User connected to real-time updates', { userId });
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleCreditUpdate(userId, data);
        } catch (error) {
          logger.error('Failed to parse real-time message', error, 'REALTIME');
        }
      };

      socket.onclose = () => {
        connection.isConnected = false;
        logger.realtime('User disconnected from real-time updates', { userId });
        this.handleReconnection(userId);
      };

      socket.onerror = (error) => {
        logger.error('WebSocket error for user', error, 'REALTIME', { userId });
      };

      this.connections.set(userId, connection);
    } catch (error) {
      logger.error('Failed to connect user to real-time updates', error, 'REALTIME');
      throw error;
    }
  }

  /**
   * Disconnect user from real-time updates
   */
  async disconnectUser(userId: string): Promise<void> {
    try {
      const connection = this.connections.get(userId);
      if (connection) {
        connection.socket.close();
        this.connections.delete(userId);
        logger.realtime('User disconnected from real-time updates', { userId });
      }
    } catch (error) {
      logger.error('Failed to disconnect user from real-time updates', error, 'REALTIME');
      throw error;
    }
  }

  /**
   * Subscribe to credit updates for a user
   */
  subscribeToCreditUpdates(userId: string, handler: (event: CreditUpdateEvent) => void): () => void {
    if (!this.eventHandlers.has(userId)) {
      this.eventHandlers.set(userId, new Set());
    }

    this.eventHandlers.get(userId)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(userId);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(userId);
        }
      }
    };
  }

  /**
   * Broadcast credit update to all connected users
   */
  async broadcastCreditUpdate(event: CreditUpdateEvent): Promise<void> {
    try {
      const connection = this.connections.get(event.userId);
      if (connection && connection.isConnected) {
        connection.socket.send(JSON.stringify(event));
        logger.realtime('Credit update broadcasted', {
          userId: event.userId,
          balance: event.balance,
          transactionType: event.transactionType,
        });
      }
    } catch (error) {
      logger.error('Failed to broadcast credit update', error, 'REALTIME');
      throw error;
    }
  }

  /**
   * Handle credit update event
   */
  private handleCreditUpdate(userId: string, event: CreditUpdateEvent): void {
    try {
      const handlers = this.eventHandlers.get(userId);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            logger.error('Error in credit update handler', error, 'REALTIME');
          }
        });
      }

      logger.realtime('Credit update processed', {
        userId,
        balance: event.balance,
        transactionType: event.transactionType,
      });
    } catch (error) {
      logger.error('Failed to handle credit update', error, 'REALTIME');
    }
  }

  /**
   * Handle reconnection for disconnected users
   */
  private handleReconnection(userId: string): void {
    const connection = this.connections.get(userId);
    if (!connection) return;

    if (connection.reconnectAttempts < this.config.maxReconnectAttempts) {
      connection.reconnectAttempts++;
      
      setTimeout(() => {
        this.connectUser(userId);
      }, this.config.reconnectInterval);
      
      logger.realtime('Attempting to reconnect user', {
        userId,
        attempt: connection.reconnectAttempts,
      });
    } else {
      logger.realtime('Max reconnection attempts reached', { userId });
      this.connections.delete(userId);
    }
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    setInterval(() => {
      const now = Date.now();
      const heartbeatInterval = 30000; // 30 seconds

      for (const [userId, connection] of this.connections.entries()) {
        if (now - connection.lastHeartbeat > heartbeatInterval) {
          if (connection.isConnected) {
            try {
              connection.socket.send(JSON.stringify({ type: 'heartbeat' }));
              connection.lastHeartbeat = now;
            } catch (error) {
              logger.error('Heartbeat failed for user', error, 'REALTIME', { userId });
              connection.isConnected = false;
            }
          }
        }
      }
    }, heartbeatInterval);
  }

  /**
   * Get connection status for a user
   */
  getConnectionStatus(userId: string): {
    connected: boolean;
    reconnectAttempts: number;
    lastHeartbeat: number;
  } {
    const connection = this.connections.get(userId);
    if (!connection) {
      return {
        connected: false,
        reconnectAttempts: 0,
        lastHeartbeat: 0,
      };
    }

    return {
      connected: connection.isConnected,
      reconnectAttempts: connection.reconnectAttempts,
      lastHeartbeat: connection.lastHeartbeat,
    };
  }

  /**
   * Get all connected users
   */
  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys()).filter(userId => {
      const connection = this.connections.get(userId);
      return connection && connection.isConnected;
    });
  }
}

// Create singleton instance
const realtimeCreditUpdates = new RealtimeCreditUpdates({
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 5,
});

export default realtimeCreditUpdates;
export { RealtimeCreditUpdates };
