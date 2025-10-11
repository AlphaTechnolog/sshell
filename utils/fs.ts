import { readFile } from "ags/file";
import { exec, execAsync } from "ags/process"

const FILE_EXIST_CMD = (f: string) => `bash -c 'test -f "${f}" && echo yes || echo no'`;
const FOLDER_EXIST_CMD = (f: string) => `bash -c 'test -d "${f}" && echo yes || echo no'`

export const fileExists = async (f: string): Promise<boolean> => {
  return (await execAsync(FILE_EXIST_CMD(f))) === "yes";
}

export const folderExists = async (f: string): Promise<boolean> => {
  return (await execAsync(FOLDER_EXIST_CMD(f))) === "yes";
}

export const fileExistSync = (f: string): boolean => {
  return exec(FILE_EXIST_CMD(f)) === "yes";
}

export const folderExistSync = (f: string): boolean => {
  return exec(FOLDER_EXIST_CMD(f)) === "yes";
}

export const touch = (f: string): Promise<string> => {
  return execAsync(["touch", f]);
}

export const touchSync = (f: string): string => {
  return exec(["touch", f]);
}

export const readFileCreate = (f: string): string => {
  if (!fileExistSync(f)) touchSync(f);
  return readFile(f);
}
