import { execAsync } from "ags/process"

export const fileExists = async (f: string): Promise<boolean> => {
  return (await execAsync(`bash -c 'test -f "${f}" && echo yes || echo no'`)) === "yes";
}

export const folderExists = async (f: string): Promise<boolean> => {
  return (await execAsync(`bash -c 'test -d "${f}" && echo yes || echo no'`)) === "yes";
}
