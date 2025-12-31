import type {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  InjectionToken,
  Provider,
  ValueProvider,
} from '@nestjs/common';

export type AppProvider<T = any> = Provider<T>;

export type AppClassProvider<T = any> = ClassProvider<T>;
export type AppFactoryProvider<T = any> = FactoryProvider<T>;
export type AppValueProvider<T = any> = ValueProvider<T>;
export type AppExistingProvider<T = any> = ExistingProvider<T>;

export type AppInjectionToken<T = any> = InjectionToken<T>;

export const asProvider = <T = any>(provider: AppProvider<T>): AppProvider<T> =>
  provider;

export const asClassProvider = <T = any>(
  provider: AppClassProvider<T>,
): AppClassProvider<T> => provider;

export const asFactoryProvider = <T = any>(
  provider: AppFactoryProvider<T>,
): AppFactoryProvider<T> => provider;

export const asValueProvider = <T = any>(
  provider: AppValueProvider<T>,
): AppValueProvider<T> => provider;

export const asExistingProvider = <T = any>(
  provider: AppExistingProvider<T>,
): AppExistingProvider<T> => provider;
