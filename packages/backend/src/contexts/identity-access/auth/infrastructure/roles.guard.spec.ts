import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/domain/user.entity';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  // El handler y la clase tienen que ser siempre la misma referencia: el guard
  // se las pasa al Reflector y los tests las comparan por identidad.
  const handler = () => undefined;
  class Controller {}

  const contextWith = (user?: { role?: UserRole }) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => handler,
      getClass: () => Controller,
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('when the route does not require a role', () => {
    it.each([
      ['the metadata is missing', undefined],
      ['the list of roles is empty', []],
    ])('lets anyone through if %s', (_case, roles) => {
      reflector.getAllAndOverride.mockReturnValue(roles);

      expect(guard.canActivate(contextWith({ role: 'CLIENT' }))).toBe(true);
    });
  });

  describe('when the route requires ADMIN', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    });

    it('lets an admin through', () => {
      expect(guard.canActivate(contextWith({ role: 'ADMIN' }))).toBe(true);
    });

    it('rejects a client', () => {
      expect(() => guard.canActivate(contextWith({ role: 'CLIENT' }))).toThrow(
        ForbiddenException,
      );
    });

    it('rejects a request without an authenticated user', () => {
      expect(() => guard.canActivate(contextWith(undefined))).toThrow(
        ForbiddenException,
      );
    });

    it('rejects an authenticated user that carries no role', () => {
      expect(() => guard.canActivate(contextWith({}))).toThrow(
        ForbiddenException,
      );
    });
  });

  it('reads the metadata from both the handler and the controller', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = contextWith({ role: 'ADMIN' });

    guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
