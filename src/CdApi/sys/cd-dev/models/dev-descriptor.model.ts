import { CdObjModel } from "../../moduleman/models/cd-obj.model";

export interface TypeDescriptor {
  field: string;
  optional: boolean;
  typeDetails: TypeDetails;
  description: string;
}

export interface TypeDetails {
  cdObjId?: number; // reference to the type id in the cd_obj table
  isEnum?: boolean;
  isInterface?: boolean;
  isDescriptor?: boolean;
  isArray?: boolean;
  isPrimitive?: boolean;
}

export interface CdDescriptors {
  cdObjId: number;
  cdObjName: string;
  cdObjGuid?: string;
  jDetails?: TypeDescriptor[] | string; // allow string coversion for database entry
}

/**
 * Utility function to convert CdObjModel into CdDescriptors
 */
export function mapCdObjToDescriptor(cdObj: CdObjModel): CdDescriptors {
  return {
    cdObjId: cdObj.cdObjId!,
    cdObjName: cdObj.cdObjName,
    cdObjGuid: cdObj.cdObjGuid,
    jDetails: cdObj.jDetails
      ? (JSON.parse(cdObj.jDetails) as TypeDescriptor[])
      : undefined,
  };
}

/**
 * Utility function to convert CdDescriptors into CdObjModel
 */
export function mapDescriptorToCdObj(descriptor: CdDescriptors): CdObjModel {
  console.log("DevDescriptorModel::mapDescriptorToCdObj()/starting...");
  const cdObj = new CdObjModel();
  cdObj.cdObjId = descriptor.cdObjId;
  cdObj.cdObjName = descriptor.cdObjName;
  cdObj.cdObjGuid = descriptor.cdObjGuid;
  cdObj.jDetails = descriptor.jDetails
    ? JSON.stringify(descriptor.jDetails)
    : null;
  return cdObj;
}
