import { Injectable } from '@nestjs/common';
import { createRequire } from 'node:module';
import * as os from 'node:os';
import process from 'node:process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class AppService {
  private readonly require = createRequire(__filename);

  private formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );

    const value = bytes / 1024 ** unitIndex;
    const formatted =
      value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${formatted} ${units[unitIndex]}`;
  }

  private formatUptime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  }

  private isInContainer(): boolean {
    return (
      existsSync('/.dockerenv') ||
      existsSync('/proc/1/cgroup') ||
      process.env.RENDER === 'true' ||
      Boolean(process.env.RAILWAY_ENVIRONMENT) ||
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.HEROKU_APP_NAME) ||
      Boolean(process.env.KUBERNETES_SERVICE_HOST)
    );
  }

  private getContainerCpuInfo(): { model: string; cores: number } | undefined {
    try {
      if (existsSync('/sys/fs/cgroup/cpu.max')) {
        const cpuMax = readFileSync('/sys/fs/cgroup/cpu.max', 'utf8').trim();
        if (cpuMax !== 'max') {
          const [quota, period] = cpuMax.split(' ').map(Number);
          if (quota && period) {
            const cores = quota / period;
            return {
              model: 'Container CPU',
              cores: Math.round(cores * 10) / 10,
            };
          }
        }
      }

      if (
        existsSync('/sys/fs/cgroup/cpu/cpu.cfs_quota_us') &&
        existsSync('/sys/fs/cgroup/cpu/cpu.cfs_period_us')
      ) {
        const quota = parseInt(
          readFileSync('/sys/fs/cgroup/cpu/cpu.cfs_quota_us', 'utf8').trim(),
        );
        const period = parseInt(
          readFileSync('/sys/fs/cgroup/cpu/cpu.cfs_period_us', 'utf8').trim(),
        );

        if (quota > 0 && period > 0) {
          const cores = quota / period;
          return {
            model: 'Container CPU',
            cores: Math.round(cores * 10) / 10,
          };
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  private getContainerMemoryInfo():
    | { total: string; free: string }
    | undefined {
    try {
      if (existsSync('/sys/fs/cgroup/memory.max')) {
        const memMax = readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim();
        if (memMax !== 'max') {
          const maxBytes = parseInt(memMax);
          const usage = existsSync('/sys/fs/cgroup/memory.current')
            ? parseInt(
                readFileSync('/sys/fs/cgroup/memory.current', 'utf8').trim(),
              )
            : 0;

          return {
            total: this.formatBytes(maxBytes),
            free: this.formatBytes(maxBytes - usage),
          };
        }
      }

      if (existsSync('/sys/fs/cgroup/memory/memory.limit_in_bytes')) {
        const limit = parseInt(
          readFileSync(
            '/sys/fs/cgroup/memory/memory.limit_in_bytes',
            'utf8',
          ).trim(),
        );
        const usage = existsSync('/sys/fs/cgroup/memory/memory.usage_in_bytes')
          ? parseInt(
              readFileSync(
                '/sys/fs/cgroup/memory/memory.usage_in_bytes',
                'utf8',
              ).trim(),
            )
          : 0;

        if (limit < Number.MAX_SAFE_INTEGER) {
          return {
            total: this.formatBytes(limit),
            free: this.formatBytes(limit - usage),
          };
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  private safeGetPackageVersion(packageName: string): string | null {
    try {
      const pkgJson = this.require(`${packageName}/package.json`) as {
        version?: unknown;
      };
      return typeof pkgJson.version === 'string' ? pkgJson.version : null;
    } catch {
      return null;
    }
  }

  private safeReadAppPackageJson(): {
    name?: string;
    version?: string;
  } | null {
    try {
      const content = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
      const parsed = JSON.parse(content) as {
        name?: unknown;
        version?: unknown;
      };

      return {
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        version:
          typeof parsed.version === 'string' ? parsed.version : undefined,
      };
    } catch {
      return null;
    }
  }

  getSystemInfo() {
    const cpuInfo = os.cpus();
    const appPkg = this.safeReadAppPackageJson();
    const inContainer = this.isInContainer();

    const containerCpu = inContainer ? this.getContainerCpuInfo() : undefined;
    const containerMemory = inContainer
      ? this.getContainerMemoryInfo()
      : undefined;

    const cpu = containerCpu ?? {
      model: cpuInfo[0]?.model ?? undefined,
      cores: cpuInfo.length > 0 ? cpuInfo.length : undefined,
    };

    const memory = containerMemory ?? {
      total: os.totalmem() ? this.formatBytes(os.totalmem()) : undefined,
      free: os.freemem() ? this.formatBytes(os.freemem()) : undefined,
    };

    return {
      app: {
        name: appPkg?.name ?? undefined,
        version: appPkg?.version ?? undefined,
      },
      framework: {
        name: 'nestjs',
        versions: {
          core: this.safeGetPackageVersion('@nestjs/core'),
          common: this.safeGetPackageVersion('@nestjs/common'),
          platformExpress: this.safeGetPackageVersion(
            '@nestjs/platform-express',
          ),
        },
      },
      cpu,
      memory,
      os: {
        type: os.type() || undefined,
        platform: os.platform() || undefined,
        release: os.release() || undefined,
        arch: os.arch() || undefined,
        hostname: os.hostname() || undefined,
        containerized: inContainer,
      },
      node: {
        version: process.version || undefined,
        env: {
          nodeEnv: process.env.NODE_ENV || undefined,
          port: process.env.PORT || undefined,
        },
      },
      process: {
        memoryUsage: {
          rss: process.memoryUsage().rss
            ? this.formatBytes(process.memoryUsage().rss)
            : undefined,
          heapTotal: process.memoryUsage().heapTotal
            ? this.formatBytes(process.memoryUsage().heapTotal)
            : undefined,
          heapUsed: process.memoryUsage().heapUsed
            ? this.formatBytes(process.memoryUsage().heapUsed)
            : undefined,
          external: process.memoryUsage().external
            ? this.formatBytes(process.memoryUsage().external)
            : undefined,
          arrayBuffers: process.memoryUsage().arrayBuffers
            ? this.formatBytes(process.memoryUsage().arrayBuffers)
            : undefined,
        },
      },
      uptime: {
        system: os.uptime() ? this.formatUptime(os.uptime()) : undefined,
        process: process.uptime()
          ? this.formatUptime(process.uptime())
          : undefined,
      },
    };
  }
}
