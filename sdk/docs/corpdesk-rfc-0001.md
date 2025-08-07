Here is a formal and structured document that can serve as a Request for Comments (RFC), Corpdesk Documentation, and a foundation for a patent application. It is written to be suitable for developers, technical stakeholders, and legal/procedural bodies involved in technology standardization.


# Corpdesk Standard Development Architecture (RFC-0001)

## 1. Introduction

Corpdesk is a framework for building modular, distributed, and extensible applications across both backend and frontend environments. It is intentionally designed to support development automation through both CLI and AI-assisted methods. At the same time, Corpdesk follows conventional software development practices, allowing traditional developers to engage without needing to learn new tools or concepts—development can proceed entirely without the CLI or AI if preferred. This document defines the structural, naming, and organizational standards used in Corpdesk development. It provides guidance for both human developers and machine agents, forming a foundation for automated development, versioning, and runtime modularity.

This standard is language-agnostic, though illustrations in this document use Node.js with TypeScript for clarity.
## 2. File Structure and Hierarchy
### 2.1 General Directory Hierarchy

```
<root-directory>/src/<AppName-PascalCase>/
                           ├── sys/
                           │   └── <list-of-core-modules-kebab-case>/
                           └── app/
                               └── <list-of-feature-modules-kebab-case>/

```

### 2.2 Integration Consideration

Corpdesk modules may coexist or integrate with other applications or frameworks as long as the structural and naming conventions defined here are strictly preserved.
## 3. Application Structure
### 3.1 Application Types

Common Corpdesk applications include:

    cd-api: cd-api: Backend RPC-style service layer over HTTP using a but structured command envelope (CdWire). Note: Corpdesk does not follow the RESTful protocol. Instead, it uses a streamlined RPC-style interface called CdWire — a structured, JSON-based command envelope..

    cd-cli: Developer Command Line Interface

    cd-pwa: Progressive Web Application interface

Each application resides in a PascalCase-named root directory (CdApi, CdCli, CdPwa, etc).
## 4. Modules
### 4.1 Module Types

    Sys Modules: Core internal modules that power the Corpdesk system.

        Examples: user, moduleman, scheduler, cd-cli, cd-dev, etc.

    App Modules: Feature or business-specific modules, including third-party extensions.

        Examples: cd-hrm, cd-accts, coops, cd-ai, etc.

### 4.2 Module Structure

Each module consists of (at minimum):

```
<module-name-kebab-case>/
  ├── controllers/
  ├── models/
  └── services/
```

Additional directories like extra/, interfaces/, dist/, or sdk/ may be present.
## 5. Naming Conventions
### 5.1 File and Directory Naming

| Element               | Naming Convention                                                          | Example                                            |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Application Directory | PascalCase                                                                 | `CdApi`, `CdCli`                                   |
| Module Directory      | kebab-case                                                                 | `cd-scheduler`, `coops`                            |
| Controller Files      | `<name>.controller.ts` (sys)<br>`<module-name>-<name>.controller.ts` (app) | `user.controller.ts`, `coops-member.controller.ts` |
| Service Files         | `<name>.service.ts` (sys)<br>`<module-name>-<name>.service.ts` (app)       | `user.service.ts`, `coops-member.service.ts`       |
| Model Files           | `<name>.model.ts` (sys)<br>`<module-name>-<name>.model.ts` (app)           | `user.model.ts`, `coops-member.model.ts`           |
| DB Table Names        | snake\_case                                                                | `user_account`, `coops_member`                     |


### 5.2 Class and Variable Naming

| Element                   | Convention       | Example                               |
| ------------------------- | ---------------- | ------------------------------------- |
| Class Names               | PascalCase       | `CoopMemberController`, `UserService` |
| Class Attributes          | camelCase        | `createdAt`, `userEmail`              |
| Public Controller Methods | PascalCase       | `GetUserById()`                       |
| Internal Methods          | camelCase        | `resolveDependencies()`               |
| Controller Instances      | `ctl<ClassName>` | `ctlCoopMember`                       |
| Service Instances         | `sv<ClassName>`  | `svCoopMember`                        |


## 6. Instantiation and Lifecycle Rules

To enable standardization and support automation:

    No dependency injection frameworks.

    All class instances must be created without constructor arguments.

    Use a standardized init() method for class setup.

const ctlCoopMember = new CoopMemberController();
await ctlCoopMember.init(optionalInput?);

## 7. Base Module and Shared Code

    base/ directory under sys/ contains shared abstractions and base classes.

    Not considered a full module.

    Does not contain a controller.

### Examples:

    IBase.ts: Shared interfaces

    BaseService.ts: Abstract class extended by most services

## 8. Descriptors Concept
### 8.1 Purpose

Descriptors define the structure, metadata, and identity of every Corpdesk entity—modules, controllers, models, services, and CI/CD processes.

Descriptors enable:

    Standardization

    Automation

    Toolchain integration

    Runtime introspection

    Progressive documentation

### 8.2 Types of Descriptors

| Descriptor               | Purpose                      |
| ------------------------ | ---------------------------- |
| `BaseDescriptor`         | Common base descriptor       |
| `CdModuleDescriptor`     | Represents a Corpdesk module |
| `CdControllerDescriptor` | Represents a controller      |
| `CdServiceDescriptor`    | Represents a service         |
| `CdModelDescriptor`      | Represents a model           |
| `CiCdDescriptor`         | Represents CI/CD flows       |


Each descriptor has a .name property in kebab-case to maintain consistency.
```
{
  name: 'cd-scheduler',
  controllers: [{ name: 'task-runner' }],
  models: [{ name: 'task-log' }],
}
```

## 9. Design Philosophy

    Modular and extensible by design.

    Convention over configuration.

    Facilitates runtime installation and introspection.

    Language and platform agnostic.

    Emphasizes machine-readability to support intelligent automation and AI tooling.

## 10. Use Cases

    Enterprise backend systems

    AI-enabled process automation

    Modular feature deployments

    Distributed services orchestration

    Progressive web application backends

## 11. Future Scope

    Protocol versioning

    AI-assisted module scaffolding

    Intelligent descriptors registry

    Plug-and-play modules from a marketplace

    Federated module communication and sandboxing

## 12. Conclusion

The Corpdesk Standard provides a unified approach to modular software architecture. By combining strict naming conventions, a descriptor-driven model, and platform-agnostic design principles, Corpdesk enables teams and tools to collaborate and automate more effectively across the software development lifecycle.

## 13. References

    Corpdesk Descriptor Specification (forthcoming)

    RFC-0002: CdCLI Protocol Specification

    RFC-0003: Runtime Module Loader

    Git Repository: [TBD]

Document Version: RFC-0001
Status: Draft
Last Edited: August 6, 2025
Author: George Oremo
Use Case: Documentation, Standardization, Patent Support

Let me know when you’re ready to begin the RFC series (e.g. RFC-0002, 0003), or if you'd like this saved in markdown, PDF, or OpenAPI-compatible format.
Date: 2025-08-06, Time: 15:34

