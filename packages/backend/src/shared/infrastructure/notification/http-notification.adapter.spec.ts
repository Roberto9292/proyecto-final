import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SendNotificationData } from '../../domain/notification.port';
import { HttpNotificationAdapter } from './http-notification.adapter';

describe('HttpNotificationAdapter', () => {
  let adapter: HttpNotificationAdapter;
  let warn: jest.SpyInstance;
  const fetchMock = jest.fn();

  const payload: SendNotificationData = {
    userId: 'user-1',
    type: 'TASK_CREATED',
    title: 'Nueva tarea',
    message: 'Se creó la tarea "Comprar pan"',
    metadata: { taskId: '1' },
  };

  const buildAdapter = async (url?: string) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpNotificationAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((_key: string, fallback: string) => url ?? fallback),
          },
        },
      ],
    }).compile();

    return module.get(HttpNotificationAdapter);
  };

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    adapter = await buildAdapter();
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('posts the notification to the configured service', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
    });

    await adapter.send(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3060/notifications',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('uses the url coming from the configuration', async () => {
    adapter = await buildAdapter('http://notifications:9999');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
    });

    await adapter.send(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://notifications:9999/notifications',
      expect.anything(),
    );
  });

  // Una notificación es un efecto secundario: si el servicio falla, la tarea
  // igual se creó. El adaptador no puede propagar el error hacia arriba.
  it('does not fail when the service answers with an error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(adapter.send(payload)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Notification failed: 500'),
    );
  });

  it('does not fail when the service is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('fetch failed'));

    await expect(adapter.send(payload)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Notification service unreachable: fetch failed'),
    );
  });
});
