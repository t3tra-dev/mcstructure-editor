import * as nbt from "prismarine-nbt";
import { MCStructure } from "./types";
import { Buffer } from "buffer";

export async function importStructure(file: File): Promise<MCStructure> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // ArrayBufferからBufferに変換
    const buffer = Buffer.from(arrayBuffer);

    // level.dat形式かどうかを確認（8バイトのヘッダーがある場合）
    const hasLevelDatHeader =
      buffer.length > 8 &&
      buffer[0] === 0x0a &&
      buffer[1] === 0x00 &&
      buffer[2] === 0x00 &&
      buffer[3] === 0x00;

    // level.datの場合は8バイトのヘッダーをスキップ
    const dataBuffer = hasLevelDatHeader ? buffer.slice(8) : buffer;

    const { parsed } = await nbt.parse(dataBuffer, "little");
    return parsed.value as unknown as MCStructure;
  } catch (error) {
    console.error("Failed to parse structure file:", error);
    throw new Error("Invalid structure file format");
  }
}

export function exportStructure(
  structure: MCStructure,
  fileName: string
): void {
  try {
    const buffer = nbt.writeUncompressed(structure, "little");
    // BufferからUint8Arrayに変換
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".mcstructure")
      ? fileName
      : `${fileName}.mcstructure`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export structure:", error);
    throw new Error("Failed to export structure file");
  }
}
