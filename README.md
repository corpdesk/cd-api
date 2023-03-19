<h1 align="center">CORPDESK - A modern developer's platform.</h1>

<p align="center">
  <img src="aio/src/assets/images/logos/corpdesk/corpdesk.png" alt="corpdesk-logo" width="120px" height="120px"/>
  <br>
  <i>This is the repository for cd-api, the CORPDESK backend
    <br> using TypeScript/JavaScript and other languages.</i>
  <br>
</p>

<p align="center">
  <a href="https://www.corpdesk.co.ke"><strong>www.corpdesk.co.ke</strong></a>
  <br>
</p>

<p align="center">
  <a href="CONTRIBUTING.md">Contributing Guidelines</a>
  ·
  <a href="https://github.com/corpdesk/corpdesk/issues">Submit an Issue</a>
  ·
  <a href="https://blog.corpdesk.co.ke/">Blog</a>
  <br>
  <br>
</p>

<p align="center">
  <a href="https://circleci.com/gh/corpdesk/workflows/corpdesk/tree/main">
    <img src="https://img.shields.io/circleci/build/github/corpdesk/corpdesk/main.svg?logo=circleci&logoColor=fff&label=CircleCI" alt="CI status" />
  </a>&nbsp;
  <a href="https://www.npmjs.com/@corpdesk/core">
    <img src="https://img.shields.io/npm/v/@corpdesk/core.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="corpdesk on npm" />
  </a>&nbsp;
  <a href="https://discord.gg/corpdesk">
    <img src="https://img.shields.io/discord/463752820026376202.svg?logo=discord&logoColor=fff&label=Discord&color=7389d8" alt="Discord conversation" />
  </a>
</p>

<p align="center">
  <a href="https://app.circleci.com/insights/github/corpdesk/corpdesk/workflows/default_workflow?branch=main">
    <img src="https://dl.circleci.com/insights-snapshot/gh/corpdesk/corpdesk/main/default_workflow/badge.svg" alt="InsightsSnapshot" />
  </a>
</p>

<hr>

## Documentation

Get started with corpdesk, learn the fundamentals and explore advanced topics on our documentation website.

- [Getting Started][quickstart]
- [Architecture][architecture]
- [Components and Templates][componentstemplates]
- [Forms][forms]
- [API][api]

### Advanced

- [corpdesk Elements][corpdeskelements]
- [Server Side Rendering][ssr]
- [Schematics][schematics]
- [Lazy Loading][lazyloading]
- [Animations][animations]

## Development Setup

### Prerequisites

- Install [Node.js] which includes [Node Package Manager][npm]

### Setting Up a Project

Install the corpdesk CLI globally:

```
npm install -g @corpdesk/cli
```

Create workspace:

```
ng new [PROJECT NAME]
```

Run the application:

```
cd [PROJECT NAME]
ng serve
```

corpdesk is cross-platform, fast, scalable, has incredible tooling, and is loved by millions.

## Quickstart

[Get started in 5 minutes][quickstart].

## Ecosystem

<p>
  <img src="/docs/images/corpdesk-ecosystem-logos.png" alt="corpdesk ecosystem logos" width="500px" height="auto">
</p>

- [corpdesk Command Line (CLI)][cli]
- [corpdesk Material][corpdeskmaterial]

## Changelog

[Learn about the latest improvements][changelog].

## Upgrading

Check out our [upgrade guide](https://update.corpdesk.co.ke/) to find out the best way to upgrade your project.

## Contributing

### Contributing Guidelines

Read through our [contributing guidelines][contributing] to learn about our submission process, coding rules, and more.

### Want to Help?

Want to report a bug, contribute some code, or improve the documentation? Excellent! Read up on our guidelines for [contributing][contributing] and then check out one of our issues labeled as <kbd>[help wanted](https://github.com/corpdesk/corpdesk/labels/help%20wanted)</kbd> or <kbd>[good first issue](https://github.com/corpdesk/corpdesk/labels/good%20first%20issue)</kbd>.

### Code of Conduct

Help us keep corpdesk open and inclusive. Please read and follow our [Code of Conduct][codeofconduct].

## Community

Join the conversation and help the community.

- [Twitter][twitter]
- [Discord][discord]
- [Gitter][gitter]
- [YouTube][youtube]
- [StackOverflow][stackoverflow]
- Find a Local [Meetup][meetup]

[![Love corpdesk badge](https://img.shields.io/badge/corpdesk-love-blue?logo=corpdesk&corpdesk=love)](https://www.github.com/corpdesk/corpdesk)

**Love corpdesk? Give our repo a star :star: :arrow_up:.**

[contributing]: CONTRIBUTING.md
[quickstart]: https://corpdesk.co.ke/start
[changelog]: CHANGELOG.md
[ng]: https://corpdesk.co.ke
[documentation]: https://corpdesk.co.ke/docs
[corpdeskmaterial]: https://material.corpdesk.co.ke/
[cli]: https://cli.corpdesk.co.ke/
[architecture]: https://corpdesk.co.ke/guide/architecture
[componentstemplates]: https://corpdesk.co.ke/guide/displaying-data
[forms]: https://corpdesk.co.ke/guide/forms-overview
[api]: https://corpdesk.co.ke/api
[corpdeskelements]: https://corpdesk.co.ke/guide/elements
[ssr]: https://corpdesk.co.ke/guide/universal
[schematics]: https://corpdesk.co.ke/guide/schematics
[lazyloading]: https://corpdesk.co.ke/guide/lazy-loading-ngmodules
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[codeofconduct]: CODE_OF_CONDUCT.md
[twitter]: https://www.twitter.com/corpdesk
[discord]: https://discord.gg/corpdesk
[gitter]: https://gitter.im/corpdesk/corpdesk
[stackoverflow]: https://stackoverflow.com/questions/tagged/corpdesk
[youtube]: https://youtube.com/corpdesk
[meetup]: https://www.meetup.com/find/?keywords=corpdesk
[animations]: https://corpdesk.co.ke/guide/animations

# cd-api
This is CORPDESK back-end implemented using Node.js scripted in Typescript.

# Features:
- API accessed via http json based commands
- Compiled modules should be packageable and installable in any cd-api instance at runtime

# Get Started
- config file
- .env file
- npm start
``` 
/*
Curl Request:
curl -k -X POST -H 'Content-Type: application/json' -H 'anon:0' -H 'p_sid:goqes5rof9i8tcvrv341krjld8' -H 'sess_ttl:10' -H 'token:2DC1B60A-4361-A274-ACB5-622C842B545C' -d '{"m":"moduleman","c":"cd_cache","a":"read","dat":{"fields":["content_id","user_id","content"],"filter":{"content_id":"moduleman_ModulesController_GetModuleUserData_156_1010","user_id":"1010"},"token":"CADFE0DB-342F-C8DB-6EAA-7CDDE9621C52","p_sid":"s3n39am5n3l18lskvast7v5t99","sess_ttl":"10","init_ctx":"login"},"args":{"doc_from":"","doc_to":"","subject":"read cd_accts_bank","doctyp_id":""}}' https://corpdesk.net:3004/sys -v
//////////////////////////////
curl 
-k 
-X 
POST 
-H 'Content-Type: application/json' 
-H 'anon:0' 
-H 'p_sid:goqes5rof9i8tcvrv341krjld8' 
-H 'sess_ttl:10' 
-H 'token:2DC1B60A-4361-A274-ACB5-622C842B545C' 
-d '
{
    "m": "moduleman",
    "c": "cd_cache",
    "a": "read",
    "dat": {
        "fields": ["content_id", "user_id", "content"],
        "filter": {
            "content_id": "moduleman_ModulesController_GetModuleUserData_156_1010",
            "user_id": "1010"
        },
        "token": "CADFE0DB-342F-C8DB-6EAA-7CDDE9621C52",
        "p_sid": "s3n39am5n3l18lskvast7v5t99",
        "sess_ttl": "10",
        "init_ctx": "login"
    },
    "args": {
        "doc_from": "",
        "doc_to": "",
        "subject": "read cd_accts_bank",
        "doctyp_id": ""
    }
}
' https://corpdesk.net:3004/sys 
-v
*/

```

# Todo:
- Integration with mysql innodb-cluster via mysql-router
- Integration with glusterfs
- Integration with redis cluster

## Install CFSSL

The `cfssl` and `cfssljson` command line utilities will be used to provision a [PKI Infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure) and generate TLS certificates.

Download and install `cfssl` and `cfssljson`:

### OS X

```
curl -o cfssl https://storage.googleapis.com/kubernetes-the-hard-way/cfssl/1.4.1/darwin/cfssl
curl -o cfssljson https://storage.googleapis.com/kubernetes-the-hard-way/cfssl/1.4.1/darwin/cfssljson
```

```
chmod +x cfssl cfssljson
```

```
sudo mv cfssl cfssljson /usr/local/bin/
```

Some OS X users may experience problems using the pre-built binaries in which case [Homebrew](https://brew.sh) might be a better option:

```
brew install cfssl
```

### Linux


