type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    prefix?: string;
}

class Logger {
    private config: LoggerConfig;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            enabled: import.meta.env.DEV,
            level: import.meta.env.DEV ? 'debug' : 'error',
            ...config
        };
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;

        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const requestedLevelIndex = levels.indexOf(level);

        return requestedLevelIndex >= currentLevelIndex;
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
        return `${timestamp} ${prefix} [${level.toUpperCase()}] ${message}`;
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message), ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    error(message: string, error?: Error | any, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), error, ...args);
        }
    }
}

// Export singleton instances for different parts of the app
export const logger = new Logger();
export const apiLogger = new Logger({ prefix: 'API' });
export const componentLogger = new Logger({ prefix: 'COMPONENT' });

export default logger;
