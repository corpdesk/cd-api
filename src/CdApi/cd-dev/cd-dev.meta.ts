import { CdDev } from "./controllers/cd-dev.controller";
import { AppType, CdAppDescriptor } from "./models/cd-dev-descriptor.model";

const cdDev = new CdDev()

export const app: CdAppDescriptor = {
  $schema: "https://example.com/schemas/cd-api.json", // Optional schema for future use
  name: "IssueTracker",
  typeName: [AppType.Api], 
  parentProjectGuid:null,
  modules: cdDev.getModules(AppType.Api)
  //   developmentEnvironment: {
  //     workstation:
  //       getWorkstationByName('emp-12', workstations) || defaultWorkstation,
  //     dependencies: getDependanciesByNames([], dependancies), // npm, pnpm, package.json reference
  //     services: getServiceByName(), // mysql, push-services, repo
  //   },
  //   runtimeEnvironment: {
  //     // language: getLanguageByName('javascript', languages),
  //     os: getOsByName('ubuntu.22.04', operatingSystems) || defaultOs,
  //     dependencies: getDependencyByName(
  //       ['express', 'angular', 'npm'],
  //       dependencies,
  //     ),
  //     services: getServiceByName(['']),
};
