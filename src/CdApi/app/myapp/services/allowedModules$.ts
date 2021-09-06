import { Observable, of } from 'rxjs';
import { AclModuleMemberViewModel } from '../../../sys/moduleman/models/aclmodulememberview.model';
import { AclModuleViewModel } from '../../../sys/moduleman/models/aclmoduleview.model';
import { ModuleModel } from '../../../sys/moduleman/models/module.model';

export const allowedModules$: Observable<AclModuleViewModel[]> = of([
    {
        moduleGuid: '8q3khu',
        moduleEnabled: 1,
        moduleIsPublic: null,
        moduleId: 44,
        moduleName: 'comm',
        isSysModule: 1,
        moduleTypeId: 1,
        groupGuid: 'bdd82014-50bf-4ecc-9f01-543246cb8e32'
    },
    {
        moduleGuid: '-dkkm6',
        moduleEnabled: 1,
        moduleIsPublic: 1,
        moduleId: 45,
        moduleName: 'user',
        isSysModule: 1,
        moduleTypeId: 1,
        groupGuid: '-dkkm6'
    },
    {
        moduleGuid: '166005F1-D1D6-F954-0E2F-60333B3F842B',
        moduleEnabled: 1,
        moduleIsPublic: 0,
        moduleId: 92,
        moduleName: 'DocProcessing',
        isSysModule: 1,
        moduleTypeId: 1,
        groupGuid: '166005F1-D1D6-F954-0E2F-60333B3F842B'
    },
    {
        moduleGuid: '48753f8a-b262-471f-b175-1f0ec9e5206d',
        moduleEnabled: 1,
        moduleIsPublic: null,
        moduleId: 98,
        moduleName: 'file_sys',
        isSysModule: 1,
        moduleTypeId: 1,
        groupGuid: '48753f8a-b262-471f-b175-1f0ec9e5206d'
    },
    {
        moduleGuid: 'A6874D4C-F30B-CC4E-072A-7C998CCC2608',
        moduleEnabled: 1,
        moduleIsPublic: 0,
        moduleId: 109,
        moduleName: 'smart-pep',
        isSysModule: null,
        moduleTypeId: 1,
        groupGuid: null
    },
    {
        moduleGuid: '3C33747C-A25C-5FC3-07DD-21200B5B0384',
        moduleEnabled: 1,
        moduleIsPublic: 0,
        moduleId: 110,
        moduleName: 'scheduler',
        isSysModule: null,
        moduleTypeId: 1,
        groupGuid: null
    },
    {
        moduleGuid: '05CCE4BE-8210-67C1-F377-0671A83E68CB',
        moduleEnabled: 1,
        moduleIsPublic: null,
        moduleId: 252,
        moduleName: 'accts',
        isSysModule: null,
        moduleTypeId: 1,
        groupGuid: '5E35AB8B-1957-5996-D9CB-BE2251C911D1'
    },
    {
        moduleGuid: '9FA3298C-A20A-4854-3622-41624D88333E',
        moduleEnabled: 1,
        moduleIsPublic: null,
        moduleId: 234,
        moduleName: 'cd_medlab',
        isSysModule: null,
        moduleTypeId: 1,
        groupGuid: '01F7BE4C-74E1-4044-C042-81DB5EEBD3E4'
    },
    {
        moduleGuid: '04DBEDB5-3461-1265-9B00-CD3CAFF6EB0E',
        moduleEnabled: 1,
        moduleIsPublic: null,
        moduleId: 215,
        moduleName: 'cd_hrm',
        isSysModule: null,
        moduleTypeId: 1,
        groupGuid: ' \t13AF08E9-B50F-65DA-2666-2F3B85232DEB'
    },
    {
        moduleGuid: 'C620F2D8-A0AE-0406-7DB7-7ECE806722AA',
        moduleEnabled: 1,
        moduleIsPublic: 1,
        moduleId: 195,
        moduleName: 'cd_geo',
        isSysModule: 0,
        moduleTypeId: 1,
        groupGuid: '0C4E937A-B00B-A4E0-F6BC-48DC372E1AF8'
    },
    {
        moduleGuid: 'BE1E6690-0DA0-F35B-1E93-7140CFD27C09',
        moduleEnabled: 1,
        moduleIsPublic: null,
        moduleId: 357,
        moduleName: 'InteRact',
        isSysModule: 1,
        moduleTypeId: 1,
        groupGuid: '36C2CF24-65E5-8410-3E7C-8ACECC591BC2'
    }
])