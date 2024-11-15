import * as nbt from 'prismarine-nbt';
import { MCStructure } from './types';

export async function parseStructureFile(buffer: ArrayBuffer): Promise<MCStructure> {
  const { parsed } = await nbt.parse(Buffer.from(buffer));
  return parsed.value as unknown as MCStructure;
}
