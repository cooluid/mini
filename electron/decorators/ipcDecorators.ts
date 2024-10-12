import { MainToRendererChannels } from '../ipc/channels';
import { IpcService } from '../services/IpcService';

export function SendToRenderer(channel: MainToRendererChannels) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      IpcService.getInstance().sendToRenderer(channel, result);
      return result;
    };
    return descriptor;
  };
}